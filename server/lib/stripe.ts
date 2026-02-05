import Stripe from 'stripe';

/**
 * Standardized Stripe Client for Dentis OS
 * Uses process.env.STRIPE_SECRET_KEY
 */
if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is required but not set in environment variables.');
}

if (!process.env.APP_URL) {
    console.warn('WARNING: APP_URL is not set. Stripe redirects may fail in production.');
}

export const stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2023-10-16',
    typescript: true,
    appInfo: {
        name: 'Dentis OS Marketplace',
        version: '1.0.0',
    },
});

export default stripeClient;
