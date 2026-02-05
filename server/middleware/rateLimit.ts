import { Context, Next } from 'hono';
import { HTTPException } from 'hono/http-exception';

/**
 * Simple in-memory rate limiter
 * Production: Replace with Redis for multi-server support
 */

interface RateLimitConfig {
    windowMs: number; // Time window in milliseconds
    max: number; // Max requests per window
    keyPrefix: string; // Prefix for the rate limit key
    message?: string; // Custom error message
}

interface RateLimitEntry {
    count: number;
    resetTime: number;
}

// In-memory store (use Redis in production for multi-server)
const store = new Map<string, RateLimitEntry>();

// Cleanup old entries every 10 minutes
setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store.entries()) {
        if (entry.resetTime < now) {
            store.delete(key);
        }
    }
}, 10 * 60 * 1000);

/**
 * Creates a rate limiting middleware
 */
export const rateLimit = (config: RateLimitConfig) => {
    return async (c: Context, next: Next) => {
        const now = Date.now();

        // Generate key based on IP or user ID
        const auth = c.get('auth');
        const ip = c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || 'unknown';
        const userId = auth?.userId || ip;
        const key = `${config.keyPrefix}:${userId}`;

        // Get or create entry
        let entry = store.get(key);

        if (!entry || entry.resetTime < now) {
            // Create new entry
            entry = {
                count: 0,
                resetTime: now + config.windowMs
            };
            store.set(key, entry);
        }

        // Increment count
        entry.count++;

        // Check if limit exceeded
        if (entry.count > config.max) {
            const resetIn = Math.ceil((entry.resetTime - now) / 1000);
            throw new HTTPException(429, {
                message: config.message || `Too many requests. Try again in ${resetIn} seconds.`,
                res: new Response(
                    JSON.stringify({
                        error: config.message || 'Too Many Requests',
                        retryAfter: resetIn
                    }),
                    {
                        status: 429,
                        headers: {
                            'Content-Type': 'application/json',
                            'Retry-After': resetIn.toString(),
                            'X-RateLimit-Limit': config.max.toString(),
                            'X-RateLimit-Remaining': '0',
                            'X-RateLimit-Reset': entry.resetTime.toString()
                        }
                    }
                )
            });
        }

        // Add rate limit headers
        c.header('X-RateLimit-Limit', config.max.toString());
        c.header('X-RateLimit-Remaining', (config.max - entry.count).toString());
        c.header('X-RateLimit-Reset', entry.resetTime.toString());

        await next();
    };
};

/**
 * Pre-configured rate limiters for common use cases
 */

// Auth endpoints: 5 requests per 15 minutes
export const authRateLimit = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    keyPrefix: 'auth',
    message: 'Muitas tentativas de login. Tente novamente em alguns minutos.'
});

// AI chat: 20 requests per minute
export const aiRateLimit = rateLimit({
    windowMs: 60 * 1000,
    max: 20,
    keyPrefix: 'ai',
    message: 'Muitas requisições ao assistente de IA. Aguarde um momento.'
});

// File uploads: 10 per hour
export const uploadRateLimit = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 10,
    keyPrefix: 'upload',
    message: 'Limite de uploads atingido. Tente novamente em 1 hora.'
});

// WhatsApp/messaging: 50 per day per organization
export const messagingRateLimit = rateLimit({
    windowMs: 24 * 60 * 60 * 1000,
    max: 50,
    keyPrefix: 'messaging',
    message: 'Limite diário de mensagens atingido. Envios serão retomados amanhã.'
});

// General API: 100 requests per minute (per user)
export const generalRateLimit = rateLimit({
    windowMs: 60 * 1000,
    max: 100,
    keyPrefix: 'api',
    message: 'Muitas requisições. Aguarde alguns segundos.'
});
