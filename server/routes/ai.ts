import { Hono } from 'hono';
import { requireRole, requireMfa } from '../middleware/auth';
import OpenAI from 'openai';
import { detectJailbreak, sanitizeInput } from '../utils/ai_safety';
import { SAFE_PROMPT_TEMPLATE } from '../ai/prompts';
import { canUseTool, requiresApproval, SENSITIVE_TOOLS } from '../ai/tools_policy';
import { checkRateLimit } from '../utils/rate_limit';
import { logAudit } from '../services/audit';

const app = new Hono<{ Variables: { user: any; organizationId: string } }>();

app.post("/chat", requireRole(['dentist', 'admin', 'receptionist']), requireMfa, async (c) => {
  const user = c.get('user');
  const organizationId = c.get('organizationId');

  // 1. Rate Limiting
  if (!checkRateLimit(`user:${user.id}`)) {
    return c.json({ error: "Too many requests. Please wait a moment." }, 429);
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return c.json({ error: "AI Service Unavailable" }, 503);

  const { message, toolCall } = await c.req.json(); // toolCall opcional

  // 2. Security: Input Sanitization
  const safeMessage = sanitizeInput(message || '');

  // 3. Security: Jailbreak Detection
  if (detectJailbreak(safeMessage)) {
    console.warn(`SECURITY: Jailbreak attempt by User ${user.id}: "${safeMessage}"`);
    await logAudit({
      userId: user.id,
      action: 'AI_JAILBREAK_ATTEMPT',
      resourceType: 'ai_chat',
      tenantId: organizationId,
      reason: 'Jailbreak pattern detected',
      details: { input: safeMessage }
    });
    return c.json({ answer: "I cannot comply with that request due to safety policies." }, 403);
  }

  // 4. Tool Governance (If user is trying to execute a tool)
  if (toolCall) {
    if (!canUseTool(user.role, toolCall.name)) {
      return c.json({ error: `Unauthorized tool: ${toolCall.name}` }, 403);
    }

    // "Human-in-the-Loop" for Sensitive Actions
    if (requiresApproval(toolCall.name)) {
      return c.json({
        status: 'PROPOSAL_REQUIRED',
        message: `Authorization needed for ${toolCall.name}.`,
        proposalId: crypto.randomUUID() // Stub
      });
    }
  }

  const openai = new OpenAI({ apiKey });

  // 5. Construct Safe System Prompt
  const toolPolicyText = `Allowed tools for ${user.role}: ${JSON.stringify(canUseTool(user.role, '*'))}`;
  const systemContext = `User: ${user.name} (${user.role})`;

  const systemPrompt = SAFE_PROMPT_TEMPLATE(
    "Assist with dental practice management.",
    systemContext,
    toolPolicyText
  );

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: safeMessage }
      ],
      temperature: 0.3, // Lower temp for stability
    });

    return c.json({ answer: response.choices[0].message.content });
  } catch (error: any) {
    console.error("OpenAI Error:", error);
    return c.json({ error: "AI processing failed" }, 500);
  }
});

export default app;