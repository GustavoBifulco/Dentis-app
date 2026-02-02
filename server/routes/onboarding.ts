import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { clerkClient } from '@clerk/clerk-sdk-node';
import { setupNewUserEnvironment } from '../services/userSetup';

const onboarding = new Hono();

const onboardingSchema = z.object({
  role: z.string(),
  userId: z.string(),
  name: z.string().optional(),
  cpf: z.string().optional(),
  cro: z.string().optional(),
  phone: z.string().optional()
});

onboarding.post('/complete', zValidator('json', onboardingSchema), async (c) => {
  const data = c.req.valid('json');
  try {
    await clerkClient.users.updateUser(data.userId, {
      publicMetadata: { onboardingComplete: true, role: data.role }
    });
    // Setup normal (sem forçar)
    await setupNewUserEnvironment(data.userId, data.role, false);
    return c.json({ success: true });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
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

export default onboarding;
