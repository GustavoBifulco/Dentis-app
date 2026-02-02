import { clerkClient } from '@clerk/clerk-sdk-node';
import { db } from '../db';
import { users, organizationMembers, organizations } from '../db/schema';
import { eq, and } from 'drizzle-orm';
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

  // Fallback or dev header (Keeping for compatibility but optimized)
  if (!clerkId && devUserId) {
    if (isNaN(Number(devUserId))) {
      clerkId = devUserId;
    } else {
      const dbUser = await db.query.users.findFirst({ where: eq(users.id, Number(devUserId)) });
      if (dbUser) clerkId = dbUser.clerkId;
    }
  }

  if (!clerkId) {
    console.error("❌ Acesso negado: Sem userId");
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    // 1. Fetch User and Context from Clerk / Cache / DB
    // Otimização: Ler do publicMetadata via Clerk SDK se necessário, 
    // mas aqui buscamos no banco para garantir consistência.
    const user = await db.query.users.findFirst({
      where: eq(users.clerkId, clerkId),
      with: {
        professionalProfile: true,
        courierProfile: true,
      }
    });

    if (!user) return c.json({ error: 'User not found' }, 404);

    // 2. Organization Context (Ler do Clerk Claims se disponível, ou do Header da Ordem se mockado)
    const clerkOrgId = c.req.header('x-org-id'); // Simula seleção de organização no frontend

    const membership = await db.query.organizationMembers.findFirst({
      where: and(
        eq(organizationMembers.userId, user.id),
        clerkOrgId ? eq(organizations.clerkOrgId, clerkOrgId) : undefined
      )
    });

    // 3. Derive Capabilities
    // Aqui usamos o PermissionManager para definir o que o usuário PODE fazer
    const capabilities = {
      isOrgAdmin: membership?.role === 'admin',
      isHealthProfessional: !!user.professionalProfile,
      isCourier: !!user.courierProfile,
      isPatient: !user.professionalProfile && !user.courierProfile
    };

    // 4. Injetar no Contexto do Hono
    c.set('userId', user.id);
    c.set('clerkId', clerkId);
    c.set('capabilities', capabilities);

    if (membership) {
      c.set('organizationId', membership.organizationId);
      c.set('orgRole', membership.role);
    }

    await next();
  } catch (error) {
    console.error("Erro no Auth Middleware (RBAC):", error);
    return c.json({ error: 'Internal Server Error' }, 500);
  }
};
