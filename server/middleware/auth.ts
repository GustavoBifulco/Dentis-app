
import { Context, Next } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { createClerkClient } from '@clerk/backend';
import { db } from '../db';
import { users, organizationMembers, organizations } from '../db/schema';
import { seedDefaultData } from '../services/seedData';
import { eq } from 'drizzle-orm';

// Initialize Clerk client with environment variables
const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY!,
  publishableKey: process.env.CLERK_PUBLISHABLE_KEY!,
});

// Estenda o contexto do Hono para incluir o usuário
declare module 'hono' {
  interface ContextVariableMap {
    user: any;
    auth: any;
    organizationId: string;
    userId: number;
    clerkId: string;
  }
}

export const authMiddleware = async (c: Context, next: Next) => {
  const authHeader = c.req.header('Authorization');

  // 1. Modo de Bypass para desenvolvimento (Hardening: NÃO funciona em produção)
  if (process.env.DISABLE_AUTH === 'true' && process.env.NODE_ENV !== 'production') {
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
    c.set('organizationId', 'dev_org_id');
    c.set('userId', 1);
    c.set('clerkId', 'dev_clerk_id');
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

    // Integração Real com Clerk usando novo SDK
    let authState;
    try {
      // authenticateRequest requires a Request object
      // Hono's c.req.raw provides the underlying Request object
      authState = await clerkClient.authenticateRequest(c.req.raw, {
        secretKey: process.env.CLERK_SECRET_KEY!,
        publishableKey: process.env.CLERK_PUBLISHABLE_KEY!,
      });

      if (!authState.isSignedIn) {
        throw new Error('Not authenticated');
      }
    } catch (err) {
      console.error("Clerk Token Verification Failed:", err);
      throw new HTTPException(401, { message: 'Invalid or expired token' });
    }

    const clerkId = authState.toAuth().userId;

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
      sessionClaims: authState.toAuth(),
      token: token,
      userId: dbUser?.id,
      organizationId: contextOrgId,
      role: contextRole
    });

    c.set('organizationId', contextOrgId);
    if (dbUser?.id) c.set('userId', dbUser.id);
    c.set('clerkId', clerkId);

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

/**
 * MFA enforcement middleware with smart gating.
 * - Always requires MFA for clinical/sensitive actions (prontuário, sign, export, download)
 * - Non-clinical actions have 7-day grace period after signup
 * - Uses Clerk's MFA verification status
 */
export const requireMfa = async (c: Context, next: Next) => {
  const user = c.get('user');
  const auth = c.get('auth');

  // Skip MFA check in development mode
  if (process.env.DISABLE_AUTH === 'true' && process.env.NODE_ENV !== 'production') {
    await next();
    return;
  }

  // If user doesn't exist in DB yet (onboarding), skip MFA
  if (!user || !user.id || user.role === 'guest') {
    await next();
    return;
  }

  // Check if MFA is verified via Clerk session claims
  // Clerk sets 'amr' (authentication method reference) when MFA is used
  const sessionClaims = auth?.sessionClaims || {};
  const mfaVerified = sessionClaims.amr?.includes('mfa') ||
    sessionClaims.amr?.includes('totp') ||
    user.mfaVerified === true;

  if (mfaVerified) {
    c.set('user', { ...user, mfaVerified: true });
    await next();
    return;
  }

  // User has NOT verified MFA - check grace period for non-clinical routes
  const userCreatedAt = user.createdAt ? new Date(user.createdAt) : new Date(0);
  const daysSinceSignup = Math.floor((Date.now() - userCreatedAt.getTime()) / (1000 * 60 * 60 * 24));
  const GRACE_PERIOD_DAYS = 7;
  const isWithinGracePeriod = daysSinceSignup <= GRACE_PERIOD_DAYS;

  // Determine if this is a sensitive action that ALWAYS requires MFA
  const path = c.req.path.toLowerCase();
  const method = c.req.method.toUpperCase();

  const sensitivePatterns = [
    '/api/records/',      // All clinical records
    '/encounters',        // Clinical encounters
    '/prescriptions',     // Prescriptions
    '/download',          // File downloads
    '/export',            // Data exports
    '/sign',              // Document signing
    '/api/finance',       // Financial operations
    '/api/billing',       // Billing
  ];

  const isSensitiveAction = sensitivePatterns.some(pattern => path.includes(pattern)) ||
    (method === 'DELETE'); // All deletes are sensitive

  if (isSensitiveAction) {
    // Sensitive actions NEVER skip MFA (no grace period)
    console.warn(`[MFA] Blocked sensitive action ${method} ${path} for user ${user.id} - MFA not verified`);
    throw new HTTPException(403, {
      message: 'MFA required for this action. Please verify your identity.',
      cause: 'MFA_REQUIRED'
    });
  }

  // Non-sensitive action within grace period - allow but log warning
  if (isWithinGracePeriod) {
    console.info(`[MFA] Grace period active for user ${user.id} (day ${daysSinceSignup}/${GRACE_PERIOD_DAYS})`);
    await next();
    return;
  }

  // Grace period expired and MFA not verified
  console.warn(`[MFA] Grace period expired for user ${user.id}. MFA required.`);
  throw new HTTPException(403, {
    message: 'Please enable two-factor authentication to continue.',
    cause: 'MFA_REQUIRED'
  });
};