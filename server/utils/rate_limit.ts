
/**
 * Basic In-Memory Rate Limiter
 * For production, use Redis (Upstash/Redis Cloud).
 */

const WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_USER = 30;

const hits = new Map<string, { count: number; resetTime: number }>();

export const checkRateLimit = (key: string): boolean => {
    const now = Date.now();
    const record = hits.get(key);

    if (!record || now > record.resetTime) {
        hits.set(key, { count: 1, resetTime: now + WINDOW_MS });
        return true;
    }

    if (record.count >= MAX_REQUESTS_PER_USER) {
        return false;
    }

    record.count += 1;
    return true;
};
