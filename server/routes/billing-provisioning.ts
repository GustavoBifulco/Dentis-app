import { Hono } from 'hono';
import Stripe from 'stripe';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { authMiddleware } from '../middleware/auth';
import { db } from '../db';
import { clinicProvisioningRequests } from '../db/schema';
import { eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2023-10-16',
});

const billingProvisioning = new Hono<{ Variables: { userId: string } }>();

billingProvisioning.use('*', authMiddleware);

const provisioningSchema = z.object({
    desiredName: z.string().optional(),
    seats: z.number().min(1).default(1),
    mode: z.string(), // solo, team, multi, user_upgrade
    planType: z.enum(['clinic_id', 'clinic_id_plus', 'clinic_id_pro', 'dentis_pro']),
    priceId: z.string().optional(),
    interval: z.enum(['month', 'year']).default('month'),
});

billingProvisioning.post('/checkout', zValidator('json', provisioningSchema), async (c) => {
    const { desiredName, seats, mode, planType, interval } = c.req.valid('json');
    let userId = c.get('userId');

    // FALLBACK: If userId (internal DB ID) is missing, try to use Clerk ID or get it from Auth
    if (!userId) {
        const auth = c.get('auth');
        userId = auth?.userId || auth?.sessionClaims?.sub; // Fallback to Clerk ID if DB ID is missing
        console.warn(`⚠️ Internal userID missing in context. Using fallback: ${userId}`);
    }

    if (!userId) {
        return c.json({ error: 'User not authenticated' }, 401);
    }

    // Resolve Price ID
    let priceId = c.req.valid('json').priceId;
    if (!priceId) {
        // Map planType + Interval to Env Vars
        if (interval === 'month') {
            switch (planType) {
                case 'clinic_id': priceId = process.env.STRIPE_PRICE_SOLO_MONTHLY; break;
                case 'clinic_id_plus': priceId = process.env.STRIPE_PRICE_TEAM_MONTHLY; break;
                case 'clinic_id_pro': priceId = process.env.STRIPE_PRICE_MULTI_MONTHLY; break;
                case 'dentis_pro': priceId = process.env.STRIPE_PRICE_DENTIS_PRO_MONTHLY; break;
            }
        } else {
            switch (planType) {
                case 'clinic_id': priceId = process.env.STRIPE_PRICE_SOLO_YEARLY; break;
                case 'clinic_id_plus': priceId = process.env.STRIPE_PRICE_TEAM_YEARLY; break;
                case 'clinic_id_pro': priceId = process.env.STRIPE_PRICE_MULTI_YEARLY; break;
                case 'dentis_pro': priceId = process.env.STRIPE_PRICE_DENTIS_PRO_YEARLY; break;
            }
        }
    }

    if (!priceId) {
        console.error(`Missing Stripe Price ID for plan: ${planType} (${interval}). Check env vars.`);
        return c.json({ error: `Configuration Error: Price ID not found for ${planType} (${interval}).` }, 500);
    }

    try {
        // 1. Create Provisioning Request
        const provisioningId = nanoid();

        await db.insert(clinicProvisioningRequests).values({
            id: provisioningId,
            dentistId: userId,
            desiredName,
            seats,
            planType,
            mode,
            status: 'checkout_created',
        });

        // 2. Create Stripe Session (Hosted)
        const origin = c.req.header('origin') || process.env.PUBLIC_APP_URL || 'https://dentis.com.br';

        const session = await stripe.checkout.sessions.create({
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            mode: 'subscription',
            allow_promotion_codes: true,
            success_url: `${origin}/billing/success?session_id={CHECKOUT_SESSION_ID}&provisioning_id=${provisioningId}`,
            cancel_url: `${origin}/settings`, // User canceled, go back to settings or dashboard
            client_reference_id: userId,
            metadata: {
                provisioningRequestId: provisioningId,
                dentistId: userId,
                userId: userId, // Required for Webhook logic
                planType,
                seats: String(seats),
                desiredName: desiredName || '',
            },
        });

        // 3. Update Request with Session ID
        await db.update(clinicProvisioningRequests)
            .set({ stripeCheckoutSessionId: session.id })
            .where(eq(clinicProvisioningRequests.id, provisioningId));

        return c.json({
            url: session.url,
            provisioningId
        });

    } catch (error: any) {
        console.error("Billing Provisioning Error:", error);
        return c.json({ error: error.message }, 500);
    }
});

// Polling Endpoint
billingProvisioning.get('/provisioning/:id', async (c) => {
    const id = c.req.param('id');
    const userId = c.get('userId');

    const [request] = await db
        .select()
        .from(clinicProvisioningRequests)
        .where(eq(clinicProvisioningRequests.id, id))
        .limit(1);

    if (!request) {
        return c.json({ error: 'Request not found' }, 404);
    }

    // Security check: only the creator can check
    if (request.dentistId !== userId) {
        return c.json({ error: 'Unauthorized' }, 403);
    }

    return c.json({
        status: request.status,
        clerkOrganizationId: request.clerkOrganizationId
    });
});

export default billingProvisioning;
