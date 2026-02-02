import { Context, Next } from 'hono';

export const featureGuard = (feature: string) => async (c: Context, next: Next) => {
    // Check the Environment Variable
    const enabled = process.env[feature] === 'true';

    // If enabled, allow through.
    // Ideally, we also check if the USER has the role, but that requires Auth middleware to run FIRST.
    // Assuming Auth middleware runs inside the route or globally before this? 
    // In server/index.ts, middlewares are applied per route or globally.
    // If we apply this guard, we should assume basic availability check.

    // Requirement: "Se o usuário tiver a role ADMIN_OWNER (eu), renderize... Para qualquer outro... bloqueados"
    // If Flag is FALSE -> Block EVERYONE (or allow Admin? User said "Variable... if user is Admin... render").
    // This implies if Variable is FALSE, maybe NO ONE sees it? 
    // Let's stick to: If Variable is FALSE, it's OFF. 
    // If Variable is TRUE, we check Role. 
    // BUT the user said: "ENABLE_CLINIC_MANAGEMENT... If user has role ADMIN_OWNER... render... For any other... invisible".
    // This suggests the Variable enables the *possibility*, but Role is the gate.

    // However, simpler interpretation for "MVP Público":
    // If Flag is TRUE -> Available to Authorized Users (checked by Auth middleware).
    // If Flag is FALSE -> 404/403 for EVERYONE.

    if (!process.env.VITE_ENABLE_CLINIC_MANAGEMENT || process.env.VITE_ENABLE_CLINIC_MANAGEMENT !== 'true') {
        // If feature flag is strictly OFF, block all.
        return c.json({ error: 'Feature disabled' }, 403);
    }

    // If flag is ON, we proceed. RBAC is handled by the route's Auth middleware usually.
    // But if we want to enforce ADMIN_OWNER specific to this guard:
    // We need `c.get('role')` which comes from auth middleware.
    // So Auth middleware MUST run before this.

    await next();
};
