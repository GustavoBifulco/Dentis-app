import { clerkClient } from '@clerk/clerk-sdk-node';
import { db } from '../db';
import { users, clinicMembers } from '../db/schema';
import { eq } from 'drizzle-orm';
import { Context } from 'hono';

export const authMiddleware = async (c: Context, next: any) => {
  // 1. Get Token
  const authHeader = c.req.header('Authorization');
  const token = authHeader?.split(' ')[1];
  const devUserId = c.req.header('x-user-id'); // For dev/testing without Clerk

  let clerkId: string | undefined;

  if (devUserId) {
    // If x-user-id header is present, we trust it for dev environment (mocking Clerk ID or resolving via DB)
    // But since logic expects clerkId to lookup user, and devUserId is likely internal ID...
    // Actually, devUserId is typically for "Acting as User ID X". 
    // If logic uses clerkId to find user, we might need a workaround.
    // Let's assume for devUserId we fetch the user directly by ID?
    // But existing logic queried by ClerkID.
    // Let's stick to Token verification primarily.
    // If devUserId is internal ID, we need to bypass clerk check.

    // For now, let's focus on Token verification which is the PRODUCTION path.
    // If devUserId is provided, we can maybe query user by ID directly?
    // But let's assume valid token.
  }

  if (token) {
    try {
      const decoded = await clerkClient.verifyToken(token);
      clerkId = decoded.sub;
    } catch (e) {
      console.error("Token verification failed:", e);
    }
  }

  // Fallback or dev header
  if (!clerkId && devUserId) {
    const user = await db.query.users.findFirst({ where: eq(users.id, Number(devUserId)) });
    if (user) clerkId = user.clerkId;
  }

  if (!clerkId) {
    console.error("❌ Acesso negado: Sem userId (Clerk ou Header)");
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    // 1. Buscar usuário no banco pelo Clerk ID
    const user = await db.query.users.findFirst({
      where: eq(users.clerkId, clerkId),
    });

    if (!user) {
      console.error("❌ Usuário não encontrado no banco:", clerkId);
      return c.json({ error: 'User not found' }, 404);
    }

    // 2. Buscar clínica (por enquanto, pega a primeira que ele é membro)
    // TODO: Permitir troca de contexto de clínica via Header
    const member = await db.query.clinicMembers.findFirst({
      where: eq(clinicMembers.userId, user.id)
    });

    // Em onboarding, pode não ter clínica ainda
    const clinicId = member?.clinicId;

    // 3. Injetar no Contexto
    c.set('userId', user.id);
    c.set('clerkId', clerkId);
    if (clinicId) {
      c.set('clinicId', clinicId);
      c.set('role', member.role);
    }

    await next();
  } catch (error) {
    console.error("Erro no Auth Middleware:", error);
    return c.json({ error: 'Internal Server Error' }, 500);
  }
};
