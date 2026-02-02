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

checkout.use('*', authMiddleware);

const sessionSchema = z.object({
  priceId: z.string(),
});

checkout.post('/create-session', zValidator('json', sessionSchema), async (c) => {
  const { priceId } = c.req.valid('json');
  const userId = c.get('userId');

  try {
    const session = await stripe.checkout.sessions.create({
      ui_mode: 'embedded', // <--- MÁGICA AQUI: Modo Embutido
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      // Redireciona para o Dashboard APÓS o sucesso (dentro do iframe ele avisa antes)
      return_url: `${c.req.header('origin')}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      client_reference_id: userId,
    });

    return c.json({ clientSecret: session.client_secret });
  } catch (error: any) {
    console.error("Erro Stripe:", error);
    return c.json({ error: error.message }, 500);
  }
});

export default checkout;
