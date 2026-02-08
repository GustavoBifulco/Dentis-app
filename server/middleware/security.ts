
import { Context, Next } from 'hono';

// --- Security Headers Middleware ---
export const securityHeaders = async (c: Context, next: Next) => {
    await next();

    // Prevent Browsers from sniffing MIME types
    c.header('X-Content-Type-Options', 'nosniff');

    // Clickjacking protection (Deny frames from other origins)
    c.header('X-Frame-Options', 'DENY');

    // XSS Protection (Deprecated in modern browsers but good for legacy)
    c.header('X-XSS-Protection', '1; mode=block');

    // Strict Transport Security (HSTS) - Enforce HTTPS for 1 year
    if (process.env.NODE_ENV === 'production') {
        c.header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
    }

    // Referrer Policy - Only send origin (domain)
    c.header('Referrer-Policy', 'strict-origin-when-cross-origin');

    // Permissions Policy (FKA Feature Policy)
    c.header('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), interest-cohort=()');

    // Content Security Policy (CSP)
    // Migrated from server/index.ts
    const cspDirectives = {
        "default-src": ["'self'"],
        "script-src": ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://*.clerk.accounts.dev", "https://clerk.dentis.com.br", "https://*.clerk.com", "https://js.stripe.com", "https://challenges.cloudflare.com"],
        "connect-src": ["'self'", "https:", "wss:", "data:"],
        "img-src": ["'self'", "data:", "https:", "https://img.clerk.com", "https://*.clerk.com"],
        "frame-src": ["'self'", "https://js.stripe.com", "https://hooks.stripe.com", "https://challenges.cloudflare.com"],
        "style-src": ["'self'", "'unsafe-inline'"],
        "worker-src": ["'self'", "blob:"],
        "font-src": ["'self'", "https:", "data:"],
        "base-uri": ["'self'"],
        "form-action": ["'self'"],
    };

    const cspString = Object.entries(cspDirectives).map(([key, values]) => {
        return `${key} ${values.join(' ')}`;
    }).join('; ');

    c.header('Content-Security-Policy', cspString);
};

// --- Body Limit Middleware ---
// Hono parses body automatically depending on content-type, but we can check Content-Length
export const bodyLimit = (maxSize: number) => {
    return async (c: Context, next: Next) => {
        const contentLength = c.req.header('content-length');
        if (contentLength && parseInt(contentLength, 10) > maxSize) {
            return c.json({ error: 'Payload Too Large' }, 413);
        }
        await next();
    };
};

// --- Restrictive CORS Middleware ---
export const secureCors = async (c: Context, next: Next) => {
    const origin = c.req.header('origin');

    // Allowed origins
    const allowedOrigins = [
        'http://localhost:3000',
        'http://localhost:3001',
        'http://localhost:3006',
        'http://localhost:5173',
        'https://dentis.com.br',
        'https://app.dentis.com.br'
    ];

    // Allow requests from allowed origins
    if (origin && (allowedOrigins.includes(origin) || origin.endsWith('.dentis.com.br'))) {
        c.header('Access-Control-Allow-Origin', origin);
        c.header('Access-Control-Allow-Methods', 'GET, HEAD, PUT, POST, DELETE, PATCH');
        c.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-user-id');
        c.header('Access-Control-Allow-Credentials', 'true');
        c.header('Vary', 'Origin');
    }

    // Handle Preflight
    if (c.req.method === 'OPTIONS') {
        return c.body(null, 204);
    }

    await next();
};
