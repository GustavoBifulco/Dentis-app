import { Hono } from 'hono';
import Stripe from 'stripe';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { authMiddleware } from '../middleware/auth';

// Inicializa o Stripe com a chave secreta do .env
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

const checkout = new Hono<{ Variables: { userId: string } }>();

// checkout.use('*', authMiddleware); // REMOVED: Blocks webhook

const sessionSchema = z.object({
  priceId: z.string(),
});

// WEBHOOK SECURE ENDPOINT
checkout.post('/webhook', async (c) => {
  const sig = c.req.header('stripe-signature');
  const body = await c.req.text();
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !endpointSecret) {
    return c.json({ error: 'Webhook Secret or Signature missing' }, 400);
  }

  let event: Stripe.Event;

  try {
    // 1. HMAC Verification (Critical Security)
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
  } catch (err: any) {
    console.warn(`⚠️  Webhook signature verification failed.`, err.message);
    return c.json({ error: `Webhook Error: ${err.message}` }, 400);
  }

  // 2. Idempotency & logic
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.client_reference_id;

      console.log(`💰 Payment success for User ${userId}`);

      // Implement Idempotency here if needed (check db if order already PAID)
      // await fulfillOrder(session);
      break;

    case 'invoice.payment_succeeded':
      // ...
      break;

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  return c.json({ received: true });
});

const PRICE_MAPPING: Record<string, string | undefined> = {
  'price_PRO_M': process.env.STRIPE_PRICE_DENTIS_PRO_MONTHLY,
  'price_CP_M': process.env.STRIPE_PRICE_TEAM_MONTHLY, // Clinic ID Business -> Team Monthly
  'price_CP_S': process.env.STRIPE_PRICE_SOLO_MONTHLY, // Clinic ID Starter -> Solo Monthly
};

checkout.post('/create-session', authMiddleware, zValidator('json', sessionSchema), async (c) => {
  const { priceId } = c.req.valid('json');
  const userId = c.get('userId');

  // Mapeia o ID amigável do front para o ID real do Stripe
  const realPriceId = PRICE_MAPPING[priceId] || priceId;

  try {
    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price: realPriceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${c.req.header('origin')}/dashboard?success=true`,
      cancel_url: `${c.req.header('origin')}/onboarding?canceled=true`,
      client_reference_id: userId,
    });

    return c.json({ url: session.url });
  } catch (error: any) {
    console.error("Erro Stripe:", error);
    return c.json({ error: error.message }, 500);
  }
});

export default checkout;
