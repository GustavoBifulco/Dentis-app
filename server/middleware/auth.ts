
import { Context, Next } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { clerkClient } from '@clerk/clerk-sdk-node';
import { db } from '../db';
import { users, organizationMembers, organizations } from '../db/schema';
import { seedDefaultData } from '../services/seedData';
import { eq } from 'drizzle-orm';

// Estenda o contexto do Hono para incluir o usuário
declare module 'hono' {
  interface ContextVariableMap {
    user: any;
    auth: any;
  }
}

export const authMiddleware = async (c: Context, next: Next) => {
  const authHeader = c.req.header('Authorization');

  // 1. Modo de Bypass para desenvolvimento (Hardening: só funciona se explicitamente habilitado)
  if (process.env.DISABLE_AUTH === 'true') {
    c.set('user', {
      id: 'dev_user_id',
      clerkId: 'dev_clerk_id',
      organizationId: 'dev_org_id',
      role: 'admin',
      mfaVerified: true
    });
    c.set('auth', {
      sessionClaims: { aud: 'dev' }
    });
    await next();
    return;
  }

  // 2. Bloqueio padrão (Security by Default)
  if (!authHeader) {
    throw new HTTPException(401, { message: 'Authentication required' });
  }

  try {
    const token = authHeader?.split(' ')[1];

    if (!token) {
      throw new HTTPException(401, { message: 'Invalid token format' });
    }

    // Integração Real com Clerk
    let decodedState;
    try {
      // verifyToken throws if invalid
      decodedState = await clerkClient.verifyToken(token);
    } catch (err) {
      console.error("Clerk Token Verification Failed:", err);
      throw new HTTPException(401, { message: 'Invalid or expired token' });
    }

    const clerkId = decodedState.sub;

    // Buscar usuário no banco para ter o ID interno e ClinicID
    // TODO: Cachear isso (Redis ou memória) para performance
    const dbUser = await db.query.users.findFirst({
      where: eq(users.clerkId, clerkId)
    });

    let contextOrgId = 'org-1';
    let contextRole = 'guest';

    if (!dbUser) {
      // Usuário autenticado no Clerk mas não no nosso DB (pode ser onboarding)
      // Permitimos passar, mas o user context fica limitado
      c.set('user', {
        clerkId,
        role: 'guest',
        mfaVerified: false
      });
    } else {
      contextRole = dbUser.role;

      // Resolver Organization ID
      // Resolver Organization ID via Members Table
      const memberRel = await db.query.organizationMembers.findFirst({
        where: eq(organizationMembers.userId, dbUser.id.toString()), // Convert to string if needed
        with: {
          organization: true
        }
      });

      if (memberRel && memberRel.organization) {
        contextOrgId = memberRel.organization.id; // Corrected: use .id not .clerkOrgId
      } else {
        // Se for dentista sem org e sem membro, tenta buscar ou criar workspace pessoal
        if (dbUser.role === 'dentist') {
          const personalId = `personal-${dbUser.clerkId}`;
          console.log(`🔧 Resolving personal workspace ${personalId} for user ${dbUser.id}`);

          // Não atualiza users com organizationId pois a coluna não existe mais.
          // Apenas define o contexto para uso na sessão.
          // Idealmente, deveria criar o membro se não existir aqui?
          // Sim, se for self-healing, deve garantir que o membro exista.

          const orgExists = await db.query.organizations.findFirst({
            where: eq(organizations.id, personalId)
          });

          if (!orgExists) {
            console.log(`Creating missing personal org ${personalId}`);
            await db.insert(organizations).values({
              id: personalId,
              name: `Consultório - ${dbUser.name}`
            }).onConflictDoNothing();
          }

          // Criar membro se não existir
          const memberExists = await db.query.organizationMembers.findFirst({
            where: eq(organizationMembers.organizationId, personalId) // Simplificado
          });

          if (!memberExists) {
            await db.insert(organizationMembers).values({
              userId: dbUser.id.toString(),
              organizationId: personalId,
              role: 'ADMIN' // Dentista dono
            }).onConflictDoNothing();
          }

          contextOrgId = personalId;
        }
      }

      c.set('user', {
        ...dbUser,
        organizationId: contextOrgId, // Override com o resolvido
        mfaVerified: false
      });
    }

    c.set('auth', {
      sessionClaims: decodedState,
      token: token,
      userId: dbUser?.id,
      organizationId: contextOrgId,
      role: contextRole
    });

    await next();
  } catch (error) {
    if (error instanceof HTTPException) throw error;
    console.error("Auth Error:", error);
    throw new HTTPException(401, { message: 'Authentication failed' });
  }
};

export const requireRole = (allowedRoles: string[]) => {
  return async (c: Context, next: Next) => {
    const auth = c.get('auth'); // Use auth instead of user

    if (!auth || (!allowedRoles.includes(auth.role) && auth.role !== 'admin')) {
      return c.json({ error: 'Forbidden: Insufficient permissions' }, 403);
    }

    await next();
  };
};

export const requireMfa = async (c: Context, next: Next) => {
  // ⚠️ MFA temporariamente desabilitado para onboarding simplificado
  await next();
};