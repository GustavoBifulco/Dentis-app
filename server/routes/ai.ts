import { Hono } from 'hono';
import { authMiddleware, requireRole, requireMfa } from '../middleware/auth';
import OpenAI from 'openai';
import { detectJailbreak, sanitizeInput } from '../utils/ai_safety';
import { SAFE_PROMPT_TEMPLATE } from '../ai/prompts';
import { canUseTool } from '../ai/tools_policy';
import { checkRateLimit } from '../utils/rate_limit';
import { logAudit } from '../services/audit';
import { db } from '../db';
import { aiConversations, aiMessages } from '../db/schema';
import { eq, desc, and } from 'drizzle-orm';
import { randomUUID } from 'crypto';

import { features, getFeatureError } from '../lib/features';
import { aiRateLimit } from '../middleware/rateLimit';
import { checkAIQuota, logAIUsage } from '../lib/usageTracking';

const app = new Hono<{ Variables: { user: any; auth: any; organizationId: string } }>();

// Generate unique request ID
const generateRequestId = () => `ai-${Date.now()}-${randomUUID().slice(0, 8)}`;

// Structured logging helper (sanitizes PII)
const logAI = (requestId: string, level: 'info' | 'warn' | 'error', message: string, meta?: Record<string, any>) => {
  const sanitizedMeta = meta ? { ...meta } : {};
  // Remove potential PII from logs
  delete sanitizedMeta.content;
  delete sanitizedMeta.email;
  delete sanitizedMeta.phone;

  const logEntry = {
    timestamp: new Date().toISOString(),
    requestId,
    level,
    message,
    ...sanitizedMeta
  };

  if (level === 'error') {
    console.error('[AI]', JSON.stringify(logEntry));
  } else if (level === 'warn') {
    console.warn('[AI]', JSON.stringify(logEntry));
  } else {
    console.log('[AI]', JSON.stringify(logEntry));
  }
};

app.use('*', authMiddleware);

// --- Endpoints ---

// 1. List Conversations
app.get('/conversations', requireRole(['dentist', 'admin', 'receptionist']), async (c) => {
  const requestId = generateRequestId();
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
    return c.json({ ok: true, data: convs, requestId });
  } catch (err: any) {
    logAI(requestId, 'error', 'Failed to list conversations', { error: err.message });
    return c.json({ ok: false, error: 'Falha ao listar conversas', code: 'LIST_FAILED', requestId }, 500);
  }
});

// 2. Get Messages
app.get('/conversations/:id/messages', requireRole(['dentist', 'admin', 'receptionist']), async (c) => {
  const requestId = generateRequestId();
  const id = parseInt(c.req.param('id'));
  const user = c.get('user');

  // Verify ownership
  const conv = await db.query.aiConversations.findFirst({
    where: and(
      eq(aiConversations.id, id),
      eq(aiConversations.userId, user.id.toString())
    )
  });

  if (!conv) {
    logAI(requestId, 'warn', 'Conversation not found', { conversationId: id, userId: user.id });
    return c.json({ ok: false, error: 'Conversa não encontrada', code: 'NOT_FOUND', requestId }, 404);
  }

  const msgs = await db.query.aiMessages.findMany({
    where: eq(aiMessages.conversationId, id),
    orderBy: [desc(aiMessages.createdAt)],
  });

  return c.json({ ok: true, data: msgs.reverse(), requestId });
});

// 3. Chat Endpoint (Main) - With rate limiting
app.post("/chat", aiRateLimit, requireRole(['dentist', 'admin', 'receptionist']), requireMfa, async (c) => {
  const requestId = generateRequestId();
  const startTime = Date.now();

  const user = c.get('user');
  const auth = c.get('auth');

  logAI(requestId, 'info', 'Chat request started', {
    userId: user?.id,
    orgId: auth?.organizationId,
    role: user?.role
  });

  // Check if AI feature is enabled
  if (!features.ai) {
    logAI(requestId, 'warn', 'AI feature disabled - OPENAI_API_KEY not configured');
    return c.json({
      ok: false,
      error: getFeatureError('ai'),
      code: 'AI_DISABLED',
      requestId
    }, 503);
  }

  // 1. Rate Limiting
  if (!checkRateLimit(`user:${user.id}`)) {
    logAI(requestId, 'warn', 'Rate limit exceeded', { userId: user.id });
    return c.json({
      ok: false,
      error: 'Muitas requisições. Aguarde um momento.',
      code: 'RATE_LIMITED',
      requestId
    }, 429);
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    logAI(requestId, 'error', 'OPENAI_API_KEY not configured');
    return c.json({
      ok: false,
      error: 'Serviço de IA indisponível. Configure OPENAI_API_KEY.',
      code: 'NO_API_KEY',
      requestId
    }, 503);
  }

  let body;
  try {
    body = await c.req.json();
  } catch {
    logAI(requestId, 'error', 'Invalid JSON body');
    return c.json({
      ok: false,
      error: 'Corpo da requisição inválido',
      code: 'INVALID_BODY',
      requestId
    }, 400);
  }

  const { message, conversationId, context } = body;

  if (!message || typeof message !== 'string' || message.trim().length === 0) {
    logAI(requestId, 'warn', 'Empty message received');
    return c.json({
      ok: false,
      error: 'Mensagem não pode estar vazia',
      code: 'EMPTY_MESSAGE',
      requestId
    }, 400);
  }

  // 2. Security: Input Sanitization
  const safeMessage = sanitizeInput(message);

  // 3. Security: Jailbreak Detection
  if (detectJailbreak(safeMessage)) {
    logAI(requestId, 'warn', 'Jailbreak attempt detected', { userId: user.id });
    await logAudit({
      userId: user.id.toString(),
      action: 'AI_JAILBREAK_ATTEMPT',
      resourceType: 'ai_chat',
      tenantId: auth.organizationId,
      details: { requestId }
    });
    return c.json({
      ok: false,
      answer: 'Não posso processar essa solicitação por questões de segurança.',
      code: 'JAILBREAK_BLOCKED',
      requestId
    }, 403);
  }

  // 3.5. Quota Check (Cost Control)
  try {
    await checkAIQuota(auth.organizationId);
  } catch (quotaError: any) {
    logAI(requestId, 'warn', 'Quota exceeded', { orgId: auth.organizationId });
    return c.json({
      ok: false,
      error: quotaError.message,
      code: 'QUOTA_EXCEEDED',
      requestId
    }, 429);
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
      logAI(requestId, 'info', 'New conversation created', { conversationId: activeConvId });
    } else {
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
    logAI(requestId, 'info', 'Calling OpenAI', { model: 'gpt-4' });

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: safeMessage }
      ],
      temperature: 0.3,
    });

    const answer = response.choices[0].message.content || "Não foi possível gerar uma resposta.";
    const tokensUsed = response.usage?.total_tokens || 0;
    const model = response.model || "gpt-4";

    // 8. Log Usage for Cost Tracking
    try {
      await logAIUsage(auth.organizationId, user.id.toString(), tokensUsed, model);
    } catch (logError) {
      logAI(requestId, 'error', 'Failed to log usage', { error: (logError as Error).message });
    }

    // 9. Assistant Message Persist
    await db.insert(aiMessages).values({
      conversationId: activeConvId,
      role: 'assistant',
      content: answer,
    });

    const duration = Date.now() - startTime;
    logAI(requestId, 'info', 'Chat completed successfully', {
      duration: `${duration}ms`,
      tokensUsed,
      model,
      conversationId: activeConvId
    });

    return c.json({
      ok: true,
      answer,
      conversationId: activeConvId,
      requestId
    });

  } catch (error: any) {
    const duration = Date.now() - startTime;

    // Detect specific OpenAI errors
    let errorCode = 'AI_ERROR';
    let errorMessage = 'Falha no processamento da IA';
    let statusCode: 500 | 429 | 503 = 500;

    if (error.status === 401) {
      errorCode = 'INVALID_API_KEY';
      errorMessage = 'Chave da API OpenAI inválida';
    } else if (error.status === 429) {
      errorCode = 'OPENAI_RATE_LIMITED';
      errorMessage = 'Limite de requisições da OpenAI atingido. Tente novamente em alguns segundos.';
      statusCode = 429;
    } else if (error.status === 500 || error.status === 503) {
      errorCode = 'OPENAI_UNAVAILABLE';
      errorMessage = 'Serviço da OpenAI temporariamente indisponível';
      statusCode = 503;
    } else if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
      errorCode = 'NETWORK_ERROR';
      errorMessage = 'Erro de conexão com o serviço de IA';
      statusCode = 503;
    }

    logAI(requestId, 'error', 'Chat failed', {
      duration: `${duration}ms`,
      errorCode,
      errorStatus: error.status,
      errorMessage: error.message?.slice(0, 200) // Truncate long error messages
    });

    return c.json({
      ok: false,
      error: errorMessage,
      code: errorCode,
      requestId
    }, statusCode);
  }
});

export default app;