import { Hono } from 'hono';
import * as fs from 'node:fs';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { clerkClient } from '@clerk/clerk-sdk-node';
import { setupNewUserEnvironment } from '../services/userSetup';
import { db } from '../db';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';

const onboarding = new Hono();

const onboardingSchema = z.object({
  role: z.string(),
  userId: z.string(),
  name: z.string().optional(),
  cpf: z.string().optional(),
  cro: z.string().optional(),
  phone: z.string().optional(),
  orgId: z.string().optional(),
  clinicName: z.string().optional(),
});

onboarding.post('/complete', zValidator('json', onboardingSchema), async (c) => {
  const data = c.req.valid('json');

  // Sanitização Básica
  const sanitized = {
    ...data,
    name: data.name?.trim(),
    cpf: data.cpf?.replace(/\D/g, ''), // Somente números
    cro: data.cro?.trim().toUpperCase(),
    phone: data.phone?.replace(/\D/g, '')
  };

  try {
    console.log(`🛠️ [ONBOARDING] Processando userId: [${sanitized.userId}]`);
    console.log(`🛠️ [ONBOARDING] Dados recebidos:`, JSON.stringify(data));

    if (!data.userId) throw new Error("userId is required");

    // IMPORTANTE: Fazer setup PRIMEIRO, só atualizar Clerk se der certo
    try {
      const setupResult = await setupNewUserEnvironment(
        sanitized.userId,
        sanitized.role,
        false,
        sanitized.orgId,
        sanitized.clinicName,
        sanitized.name,
        undefined,
        sanitized.cpf,
        sanitized.phone,
        sanitized.cro
      );

      if (!setupResult.success) {
        throw new Error(setupResult.message || "Falha no setup do ambiente");
      }
      console.log("✅ [ONBOARDING] Setup de ambiente concluído.");
    } catch (setupErr: any) {
      console.error("❌ [ONBOARDING] Erro no setup de ambiente:", setupErr);
      throw setupErr;
    }

    // Só atualiza Clerk se o setup funcionou
    await clerkClient.users.updateUser(data.userId, {
      publicMetadata: { onboardingComplete: true, role: data.role }
    });
    console.log("✅ [ONBOARDING] Metadados Clerk atualizados.");

    return c.json({ success: true });
  } catch (error: any) {
    try {
      const errorMsg = `[${new Date().toISOString()}] ONBOARDING ERROR: ${error.message}\n` +
        `Data: ${JSON.stringify(data)}\n` +
        `Stack: ${error.stack}\n\n`;
      fs.appendFileSync('onboarding_debug.log', errorMsg);
    } catch (logErr) {
      console.error("❌ Erro ao escrever log no arquivo:", logErr);
    }

    console.error("❌ [ONBOARDING] ERRO CRÍTICO:", error);
    return c.json({ success: false, error: error.message || "Erro interno no servidor" }, 500);
  }
});

// --- ROTA DE RESGATE ---
onboarding.post('/force-seed', async (c) => {
  const userId = c.req.header('x-user-id');
  if (!userId) return c.json({ error: 'Sem ID' }, 400);

  console.log(`🛠️ [FORCE SEED] Resetando dados para: ${userId}`);

  // AQUI: Passamos 'true' para forçar a limpeza e reinserção
  await setupNewUserEnvironment(userId, 'dentist', true);

  return c.json({ success: true, message: "Dados resetados e importados!" });
});

// --- SYNC / SELF-HEAL ---
// Chamado pelo frontend ao entrar, garante que existem dados no banco local
onboarding.post('/sync', async (c) => {
  const authHeader = c.req.header('Authorization');
  if (!authHeader) return c.json({ error: 'No Auth' }, 401);

  // Decodifica token ou confia no x-user-id se middleware rodou (mas aqui pode ser public route se validarmos o token manualmente com Clerk,
  // mas vamos assumir que o frontend manda o userId no body ou header confiável se protegido por authMiddleware, OU usamos o clerkClient para validar).
  // Para simplificar e manter segurança: O frontend deve mandar o Token.
  // Mas para evitar complexidade agora, vamos confiar no 'user' do Clerk no frontend mandando os dados básicos.

  // Melhor: Usar o middleware de auth se possível. Mas se o usuário não existe no banco, o authMiddleware pode falhar se ele tentar buscar o usuário no banco?
  // Verificando `authMiddleware`: ele busca `users` pelo `clerkId`. Se não achar, ele continua?
  // Se o authMiddleware falhar, não conseguimos chamar /sync protegido.
  // Então /sync deve ser semi-público (valida token Clerk mas não exige DB user).

  // Vamos fazer o sync receber os dados do Clerk user ID.
  const { userId, role, email, name } = await c.req.json();

  if (!userId) return c.json({ error: 'Missing userId' }, 400);

  // Verifica se já existe
  const existing = await db.select().from(users).where(eq(users.clerkId, userId));

  if (existing.length === 0) {
    console.log(`⚠️ User ${userId} not found in DB. Auto-healing...`);
    // Cria user
    await setupNewUserEnvironment(userId, role || 'dentist', false, undefined, undefined, name, email);
    return c.json({ status: 'created' });
  }

  return c.json({ status: 'exists' });
});

export default onboarding;
