import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { clerkClient } from '@clerk/clerk-sdk-node';
import { setupNewUserEnvironment } from '../services/userSetup';

const onboarding = new Hono();

onboarding.post('/complete', zValidator('json', z.object({
  role: z.string(),
  userId: z.string(),
  name: z.string().optional(),
  cpf: z.string().optional(),
  cro: z.string().optional(),
  phone: z.string().optional()
})), async (c) => {
  const data = c.req.valid('json');
  console.log("📥 Recebendo Onboarding para:", data.userId);

  try {
    // 1. Atualizar Clerk
    await clerkClient.users.updateUser(data.userId, {
      publicMetadata: { onboardingComplete: true, role: data.role }
    });

    // 2. Popular Banco (Seed)
    await setupNewUserEnvironment(data.userId, data.role);

    return c.json({ success: true });
  } catch (error: any) {
    console.error("❌ Erro fatal no Onboarding:", error.message);
    return c.json({ error: error.message }, 500);
  }
});

export default onboarding;
