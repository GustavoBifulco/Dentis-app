import { Context, Next } from 'hono';

/**
 * P7. Observability Middleware
 * Adds request ID and structured logging.
 */
export const requestLogger = async (c: Context, next: Next) => {
    const start = Date.now();
    const requestId = crypto.randomUUID();

    // Set Request ID for downstream usage
    c.set('requestId', requestId);
    c.header('X-Request-ID', requestId);

    await next();

    const duration = Date.now() - start;
    const { method, path } = c.req;
    const status = c.res.status;

    // Structured Log (JSON)
    const logData = {
        level: status >= 400 ? 'error' : 'info',
        timestamp: new Date().toISOString(),
        requestId,
        method,
        path,
        status,
        durationMs: duration,
        ip: c.req.header('x-forwarded-for') || 'unknown',
        userId: c.get('user')?.id || 'anonymous',
        organizationId: c.get('organizationId') || 'none'
    };

    console.log(JSON.stringify(logData));
};
