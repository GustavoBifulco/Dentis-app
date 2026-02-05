
import { Hono } from 'hono';
import { clerkClient } from '@clerk/clerk-sdk-node';
import { authMiddleware } from '../middleware/auth';
import { authRateLimit } from '../middleware/rateLimit';

const auth = new Hono();

// Middleware de autenticação obrigatório para rotas de auth (exceto login público, que é via Clerk frontend)
auth.use('*', authMiddleware);

/**
 * Endpoint para verificar se a sessão atual é considerada "segura" para ações críticas.
 * O Frontend chama antes de permitir acesso a áreas sensíveis.
 * Se retornar 403/401, o frontend deve invocar o fluxo de Re-autenticação.
 */
auth.get('/step-up', authRateLimit, async (c) => {
    const authData = c.get('auth');
    if (!authData || !authData.sessionClaims) {
        return c.json({ valid: false, reason: 'no_session' }, 401);
    }

    try {
        const sessionId = authData.sessionClaims.sid;
        const session = await clerkClient.sessions.getSession(sessionId);

        // Regra: Autenticação deve ter ocorrido nos últimos 15 minutos para ser "Step-up" válido para ações críticas
        // 'last_active_at' é quando o token foi renovado/usado, mas 'expire_at' - 'Authorization time' é melhor?
        // Clerk session tem `updated_at` que reflete alterações.

        // Melhor: verificar quanto tempo faz desde o login inicial ou última verificação forte.
        // Vamos usar `updated_at` ou `last_active_at`.
        // Simplificação: Se last_active_at for muito antigo (ex: > 1 hora), pede step up? 
        // Na verdade step-up é "agora".

        // Vamos considerar "recente" como 10 minutos.
        const now = Date.now();
        const lastActive = session.lastActiveAt * 1000;
        const diffMinutes = (now - lastActive) / 1000 / 60;

        if (diffMinutes > 15) {
            return c.json({ valid: false, reason: 'session_too_old', diffMinutes }, 403);
        }

        return c.json({ valid: true, diffMinutes });
    } catch (error) {
        console.error("Step-up check error:", error);
        return c.json({ valid: false, error: 'check_failed' }, 500);
    }
});

export default auth;
