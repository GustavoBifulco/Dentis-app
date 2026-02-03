import { Hono } from 'hono';
import { clerkClient } from '@clerk/clerk-sdk-node';
import Stripe from 'stripe';
import { db } from '../db';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';

const webhooks = new Hono();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2023-10-16',
});

/**
 * Webhook do Stripe para confirmar pagamentos
 * Quando um pagamento é confirmado, marca o onboarding como completo
 */
webhooks.post('/stripe', async (c) => {
    const sig = c.req.header('stripe-signature');
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!sig || !webhookSecret) {
        console.error('❌ Missing signature or webhook secret');
        return c.json({ error: 'Webhook configuration error' }, 400);
    }

    let event: Stripe.Event;

    try {
        const body = await c.req.text();
        event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
    } catch (err: any) {
        console.error('❌ Webhook signature verification failed:', err.message);
        return c.json({ error: `Webhook Error: ${err.message}` }, 400);
    }

    console.log(`🔔 [STRIPE WEBHOOK] Event: ${event.type}`);

    // Handle the event
    switch (event.type) {
        case 'checkout.session.completed': {
            const session = event.data.object as Stripe.Checkout.Session;

            // Pega o customer ID e metadata
            const customerId = session.customer as string;
            const metadata = session.metadata;

            if (!metadata?.userId) {
                console.error('❌ No userId in session metadata');
                return c.json({ error: 'Missing userId' }, 400);
            }

            const clerkUserId = metadata.userId;

            console.log(`✅ Payment confirmed for user ${clerkUserId}`);

            try {
                // 1. Busca user no DB
                const [user] = await db
                    .select()
                    .from(users)
                    .where(eq(users.clerkId, clerkUserId))
                    .limit(1);

                if (!user) {
                    console.error(`❌ User ${clerkUserId} not found in DB`);
                    return c.json({ error: 'User not found' }, 404);
                }

                // 2. Atualiza Clerk para marcar onboarding como completo
                await clerkClient.users.updateUser(clerkUserId, {
                    publicMetadata: {
                        onboardingComplete: true,
                        role: user.role,
                        dbUserId: user.id,
                        stripeCustomerId: customerId,
                    },
                });

                console.log(`✅ Clerk updated for ${clerkUserId} - onboarding complete`);

                // 3. TODO: Salvar subscription info no DB se necessário
                // await db.insert(subscriptions).values({...});

                return c.json({ received: true });
            } catch (error: any) {
                console.error('❌ Error processing webhook:', error);
                return c.json({ error: error.message }, 500);
            }
        }

        case 'customer.subscription.updated':
        case 'customer.subscription.deleted': {
            // TODO: Atualizar status da subscription no DB
            console.log(`📝 Subscription event: ${event.type}`);
            return c.json({ received: true });
        }

        default:
            console.log(`⚠️ Unhandled event type: ${event.type}`);
            return c.json({ received: true });
    }
});

export default webhooks;
