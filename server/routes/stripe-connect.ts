import { Hono } from 'hono';
import { stripeClient } from '../lib/stripe';
import { db } from '../db';
import { clinics, users, payments } from '../db/schema';
import { eq } from 'drizzle-orm';
import { authMiddleware } from '../middleware/auth';

const app = new Hono<{ Variables: { user: any; auth: any; organizationId: string } }>();

app.use('*', authMiddleware);

/**
 * 1. Create Connect Account
 * Creates a "Standard" or "Express" account for the clinic/professional.
 * Using Express for better UX in a marketplace model.
 */
app.post('/accounts', async (c) => {
    try {
        const organizationId = c.get('organizationId');
        if (!organizationId) {
            return c.json({ error: 'Organization ID is required' }, 400);
        }

        // Check if already has an account
        const [clinic] = await db.select().from(clinics).where(eq(clinics.id, organizationId)).limit(1);
        if (clinic?.stripeConnectedAccountId) {
            return c.json({
                stripeConnectedAccountId: clinic.stripeConnectedAccountId,
                message: 'Account already exists'
            });
        }

        // Create the Express account
        const account = await stripeClient.accounts.create({
            type: 'express',
            country: 'BR',
            capabilities: {
                card_payments: { requested: true },
                transfers: { requested: true },
            },
            business_profile: {
                name: clinic?.name || 'Dentis Professional',
                url: process.env.APP_URL,
            },
            metadata: {
                organizationId: organizationId,
            }
        });

        // Store account ID
        await db.update(clinics)
            .set({ stripeConnectedAccountId: account.id })
            .where(eq(clinics.id, organizationId));

        return c.json({ stripeConnectedAccountId: account.id });

    } catch (error: any) {
        console.error('Stripe Connect Account Creation Error:', error);
        return c.json({ error: error.message }, 500);
    }
});

/**
 * 2. Generate Onboarding Link
 * Returns a link for the professional to complete their Stripe setup.
 */
app.post('/onboarding', async (c) => {
    try {
        const organizationId = c.get('organizationId');
        const [clinic] = await db.select().from(clinics).where(eq(clinics.id, organizationId)).limit(1);

        if (!clinic?.stripeConnectedAccountId) {
            return c.json({ error: 'No Stripe account found. Create one first.' }, 400);
        }

        const accountLink = await stripeClient.accountLinks.create({
            account: clinic.stripeConnectedAccountId,
            refresh_url: `${process.env.APP_URL}/settings/payments?refresh=true`,
            return_url: `${process.env.APP_URL}/settings/payments?success=true`,
            type: 'account_onboarding',
        });

        return c.json({ url: accountLink.url });

    } catch (error: any) {
        console.error('Stripe Onboarding Link Error:', error);
        return c.json({ error: error.message }, 500);
    }
});

/**
 * 3. Check Account Status
 */
app.get('/status', async (c) => {
    try {
        const organizationId = c.get('organizationId');
        const [clinic] = await db.select().from(clinics).where(eq(clinics.id, organizationId)).limit(1);

        if (!clinic?.stripeConnectedAccountId) {
            return c.json({ status: 'not_created' });
        }

        const account = await stripeClient.accounts.retrieve(clinic.stripeConnectedAccountId);

        return c.json({
            status: account.details_submitted ? 'verified' : 'pending',
            charges_enabled: account.charges_enabled,
            payouts_enabled: account.payouts_enabled,
            requirements: account.requirements,
        });

    } catch (error: any) {
        return c.json({ error: error.message }, 500);
    }
});

/**
 * 4. Marketplace Checkout (Direct Charges)
 * Creates a checkout session where funds go DIRECTLY to the connected account.
 */
app.post('/checkout', async (c) => {
    try {
        const organizationId = c.get('organizationId');
        const body = await c.req.json();
        const { amount, description, patientId, appointmentId } = body;

        if (!amount || !patientId) {
            return c.json({ error: 'Missing amount or patientId' }, 400);
        }

        const [clinic] = await db.select().from(clinics).where(eq(clinics.id, organizationId)).limit(1);
        if (!clinic?.stripeConnectedAccountId) {
            return c.json({ error: 'Professional has no active Stripe Connect account.' }, 400);
        }

        // Record payment in DB
        const paymentId = crypto.randomUUID();

        // Create Stripe Checkout Session representing a Direct Charge
        const session = await stripeClient.checkout.sessions.create({
            mode: 'payment',
            line_items: [{
                price_data: {
                    currency: 'brl',
                    product_data: {
                        name: description || 'Serviço Odontológico',
                        description: `Paciente ID: ${patientId}`,
                    },
                    unit_amount: Math.round(Number(amount) * 100), // convert to cents
                },
                quantity: 1,
            }],
            success_url: `${process.env.APP_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}&payment_id=${paymentId}`,
            cancel_url: `${process.env.APP_URL}/payment-cancelled?payment_id=${paymentId}`,
            metadata: {
                paymentId,
                organizationId,
                patientId: String(patientId),
                appointmentId: String(appointmentId || ''),
                paymentType: 'direct_charge'
            },
            payment_intent_data: {
                application_fee_amount: Number(process.env.STRIPE_APPLICATION_FEE_CENTS || 0),
                description: description || 'Dentis OS Direct Charge',
                metadata: {
                    paymentId,
                    organizationId
                }
            },
        }, {
            stripeAccount: clinic.stripeConnectedAccountId,
        });

        // Insert into payments table
        await db.insert(payments).values({
            id: paymentId,
            organizationId,
            patientId: Number(patientId),
            appointmentId: appointmentId ? Number(appointmentId) : null,
            amount: String(amount),
            currency: 'brl',
            status: 'pending',
            stripeConnectedAccountId: clinic.stripeConnectedAccountId,
            stripeCheckoutSessionId: session.id,
            description: description || 'Serviço Odontológico',
        });

        return c.json({ url: session.url, paymentId });

    } catch (error: any) {
        console.error('Marketplace Checkout Error:', error);
        return c.json({ error: error.message }, 500);
    }
});

export default app;
