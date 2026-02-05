import { Hono } from 'hono';
import { requireRole, requireMfa } from '../middleware/auth';
import OpenAI from 'openai';
import { detectJailbreak, sanitizeInput } from '../utils/ai_safety';
import { SAFE_PROMPT_TEMPLATE } from '../ai/prompts';
import { canUseTool, requiresApproval } from '../ai/tools_policy'; // removed SENSITIVE_TOOLS if unused
import { checkRateLimit } from '../utils/rate_limit';
import { logAudit } from '../services/audit';
import { db } from '../db';
import { aiConversations, aiMessages } from '../db/schema';
import { eq, desc, and } from 'drizzle-orm';

const app = new Hono<{ Variables: { user: any; auth: any; organizationId: string } }>();

// --- Endpoints ---

// 1. List Conversations
app.get('/conversations', requireRole(['dentist', 'admin', 'receptionist']), async (c) => {
  const auth = c.get('auth');
  const user = c.get('user');

  try {
    const convs = await db.query.aiConversations.findMany({
      where: and(
        eq(aiConversations.userId, user.id.toString()),
        eq(aiConversations.organizationId, auth.organizationId)
      ),
      orderBy: [desc(aiConversations.updatedAt)],
      limit: 50
    });
    return c.json(convs);
  } catch (err: any) {
    console.error("Error listing conversations:", err);
    return c.json({ error: "Failed to list conversations" }, 500);
  }
});

// 2. Get Messages
app.get('/conversations/:id/messages', requireRole(['dentist', 'admin', 'receptionist']), async (c) => {
  const id = parseInt(c.req.param('id'));
  const user = c.get('user');

  // Verify ownership
  const conv = await db.query.aiConversations.findFirst({
    where: and(
      eq(aiConversations.id, id),
      eq(aiConversations.userId, user.id.toString())
    )
  });

  if (!conv) return c.json({ error: "Conversation not found" }, 404);

  const msgs = await db.query.aiMessages.findMany({
    where: eq(aiMessages.conversationId, id),
    orderBy: [desc(aiMessages.createdAt)], // Reverse order for UI usually, or ASC? Let's use DESC + reverse in UI or ASC here. 
    // Standard chat UI usually wants newest at bottom, so ASC is easier if loading all.
  });

  // Return ASC for easy UI rendering
  return c.json(msgs.reverse());
});

// 3. Chat Endpoint (Main)
app.post("/chat", requireRole(['dentist', 'admin', 'receptionist']), requireMfa, async (c) => {
  const user = c.get('user');
  const auth = c.get('auth');

  // 1. Rate Limiting
  if (!checkRateLimit(`user:${user.id}`)) {
    return c.json({ error: "Too many requests. Please wait a moment." }, 429);
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return c.json({ error: "AI Service Unavailable" }, 503);

  const { message, conversationId, context } = await c.req.json();

  // 2. Security: Input Sanitization
  const safeMessage = sanitizeInput(message || '');

  // 3. Security: Jailbreak Detection
  if (detectJailbreak(safeMessage)) { // Simplified check
    console.warn(`SECURITY: Jailbreak attempt by User ${user.id}: "${safeMessage}"`);
    await logAudit({
      userId: user.id.toString(),
      action: 'AI_JAILBREAK_ATTEMPT',
      resourceType: 'ai_chat',
      tenantId: auth.organizationId,
      details: { input: safeMessage }
    });
    return c.json({ answer: "I cannot comply with that request due to safety policies." }, 403);
  }

  // 4. Persistence: Resolve/Create Conversation
  let activeConvId = conversationId;

  try {
    if (!activeConvId) {
      const [newConv] = await db.insert(aiConversations).values({
        userId: user.id.toString(),
        organizationId: auth.organizationId,
        title: safeMessage.slice(0, 30) + (safeMessage.length > 30 ? '...' : ''),
      }).returning();
      activeConvId = newConv.id;
    } else {
      // Touch updatedAt
      await db.update(aiConversations)
        .set({ updatedAt: new Date() })
        .where(eq(aiConversations.id, activeConvId));
    }

    // 5. User Message Persist
    await db.insert(aiMessages).values({
      conversationId: activeConvId,
      role: 'user',
      content: safeMessage,
      metadata: context || {}
    });

    const openai = new OpenAI({ apiKey });

    // 6. System Prompt Construction
    const toolPolicyText = `Allowed tools for ${user.role}: ${JSON.stringify(canUseTool(user.role, '*'))}`;
    const systemContext = `User: ${user.name} (${user.role}). Context: ${JSON.stringify(context || {})}`;
    const systemPrompt = SAFE_PROMPT_TEMPLATE("Assist with dental practice management.", systemContext, toolPolicyText);

    // 7. OpenAI Call
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: systemPrompt },
        // TODO: Include history here? For MVP, just current message + system. 
        // Ideally we fetch last N messages.
        { role: "user", content: safeMessage }
      ],
      temperature: 0.3,
    });

    const answer = response.choices[0].message.content || "No response generated.";

    // 8. Assistant Message Persist
    await db.insert(aiMessages).values({
      conversationId: activeConvId,
      role: 'assistant',
      content: answer,
    });

    return c.json({
      answer,
      conversationId: activeConvId
    });

  } catch (error: any) {
    console.error("OpenAI/DB Error:", error);
    return c.json({ error: "AI processing failed", details: error.message }, 500);
  }
});

export default app;