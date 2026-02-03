
import { Context, Next } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { clerkClient } from '@clerk/clerk-sdk-node';
import { db } from '../db';
import { users } from '../db/schema';
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

    if (!dbUser) {
      // Usuário autenticado no Clerk mas não no nosso DB (pode ser onboarding)
      // Permitimos passar, mas o user context fica limitado
      c.set('user', {
        clerkId,
        role: 'guest',
        mfaVerified: false // Assumimos false se não checamos claims ainda
      });
    } else {
      c.set('user', {
        ...dbUser, // id, organizationId, etc.
        mfaVerified: false // Será preenchido abaixo
      });
    }

    // Check MFA status from claims if available (act)
    // Clerk session claims usually have "act" claim if impersonating, but MFA status requires checking session or factors.
    // Simplifying: We rely on the Frontend to enforce MFA login or Step-up.
    // But for Step-up (re-auth), we can check 'last_active_at' or session approach if needed.
    // For now, we will mark mfaVerified based on a claim or assumption.
    // If specific MFA claims are needed, we check them here.

    c.set('auth', {
      sessionClaims: decodedState,
      token: token
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
    const user = c.get('user');

    if (!user || (!allowedRoles.includes(user.role) && user.role !== 'admin')) {
      // Se user for guest/undefined ou role não bater
      return c.json({ error: 'Forbidden: Insufficient permissions' }, 403);
    }

    await next();
  };
};

export const requireMfa = async (c: Context, next: Next) => {
  const user = c.get('user');
  const auth = c.get('auth');

  // Se estiver em modo dev bypass, passa
  if (process.env.DISABLE_AUTH === 'true') {
    await next();
    return;
  }

  // Verificação real de MFA
  // O token JWT do Clerk não traz verificação de MFA por padrão direto sem sessões customizadas.
  // A melhor forma no backend sem fazer roundtrip na session API é checar se o usuário tem MFA enabled
  // e se o token é recente (para step-up).

  // Para simplificar a fase 1, vamos checar se o usuário tem a flag mfaEnabled (que vamos ter que pegar do clerkClient ou do token se customizarmos)
  // Como não temos custom claims garantidas, vamos buscar o user no Clerk se mfaEnabled não estiver no nosso DB.

  // Otimização: ler do DB local se tivermos syncado `mfaEnabled` boolean ou ler do Clerk.
  // Vamos ler do Clerk User object para ser seguro (real-time).
  try {
    const clerkUser = await clerkClient.users.getUser(user.clerkId);

    // Verifica se tem 2FA habilitado
    const mfaEnabled = clerkUser.twoFactorEnabled;

    if (!mfaEnabled) {
      throw new HTTPException(403, { message: 'MFA Required: Please enable 2FA in your account settings.' });
    }

    // Se quisermos checar se a SESSÃO atual foi verificada com MFA, precisáriamos checar a Sessão.
    // const session = await clerkClient.sessions.getSession(auth.sessionClaims.sid);
    // if (session.status === 'active' && ...)

    // Por ora, a exigência é "MFA Verified" -> ou seja, ter ativado.
    // O step-up é outra checagem (re-auth).

  } catch (err) {
    if (err instanceof HTTPException) throw err;
    console.error("MFA Check Error:", err);
    throw new HTTPException(500, { message: 'Failed to verify MFA status' });
  }

  await next();
};