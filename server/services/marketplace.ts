
import { db } from '../db';
import { catalogItems } from '../db/schema'; // Assuming coupons table exists or simulated
import { eq, and } from 'drizzle-orm';
import { HTTPException } from 'hono/http-exception';

// Mock Coupons (In production, replace with DB table 'coupons')
const MOCK_COUPONS: Record<string, { type: 'PERCENT' | 'FIXED', value: number, maxUsage: number, currentUsage: number }> = {
    'DENTIS_LAUNCH': { type: 'PERCENT', value: 20, maxUsage: 100, currentUsage: 5 },
    'WELCOME_10': { type: 'FIXED', value: 10.00, maxUsage: 1000, currentUsage: 50 },
};

export const validateCoupon = async (code: string, userId: number | string) => {
    const coupon = MOCK_COUPONS[code.toUpperCase()];

    if (!coupon) {
        throw new HTTPException(400, { message: 'Invalid or expired coupon.' });
    }

    if (coupon.currentUsage >= coupon.maxUsage) {
        throw new HTTPException(400, { message: 'Coupon usage limit reached.' });
    }

    // Check usage per user (would require a 'coupon_usage' table)
    // const usage = await db.query.couponUsage.findFirst({ ... })
    // if (usage) throw ...

    return coupon;
};

export const validatePrice = async (itemId: number, requestedPrice: number) => {
    const item = await db.query.catalogItems.findFirst({
        where: eq(catalogItems.id, itemId)
    });

    if (!item) {
        throw new HTTPException(404, { message: 'Item not found in catalog.' });
    }

    // Floating point comparison with small epsilon
    const dbPrice = parseFloat(item.price);
    if (Math.abs(dbPrice - requestedPrice) > 0.01) {
        console.warn(`SECURITY: Price mismatch for Item ${itemId}. Req: ${requestedPrice}, Real: ${dbPrice}`);
        // Can either throw or return correct price
        // Throwing is safer to prevent sneaky users
        throw new HTTPException(400, { message: `Price mismatch. Please refresh.` });
    }

    return item;
};
