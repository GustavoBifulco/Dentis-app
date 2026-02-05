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
    mode: z.string(), // solo, team, multi
    planType: z.enum(['clinic_id', 'clinic_id_plus', 'clinic_id_pro']),
    priceId: z.string(), // We trust the client sends the correct price ID mapped from the plan
});

billingProvisioning.post('/checkout', zValidator('json', provisioningSchema), async (c) => {
    const { desiredName, seats, mode, planType, priceId } = c.req.valid('json');
    const userId = c.get('userId');

    try {
        // 1. Create Provisioning Request (Draft)
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

        // 2. Create Stripe Session
        const origin = c.req.header('origin') || process.env.PUBLIC_APP_URL;

        const session = await stripe.checkout.sessions.create({
            ui_mode: 'embedded',
            line_items: [
                {
                    price: priceId,
                    quantity: 1, // Subscription quantity (usually 1 base fee, seats might be separate line items or tiered price)
                    // keeping it simple 1 for now as per "Price ID" logic
                },
            ],
            mode: 'subscription',
            return_url: `${origin}/billing/success?session_id={CHECKOUT_SESSION_ID}&provisioning_id=${provisioningId}`,
            client_reference_id: userId,
            metadata: {
                provisioningRequestId: provisioningId,
                dentistId: userId,
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
            clientSecret: session.client_secret,
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
