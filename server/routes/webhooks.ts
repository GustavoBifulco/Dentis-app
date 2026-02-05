import { Hono } from 'hono';
import { createClerkClient } from '@clerk/backend';

const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY! });
import Stripe from 'stripe';
import { db } from '../db';
import { users, clinicProvisioningRequests, clinics, clinicMemberships, subscriptions } from '../db/schema';
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

                // === CLINIC PROVISIONING LOGIC ===
                if (metadata?.provisioningRequestId) {
                    const provisioningId = metadata.provisioningRequestId;
                    console.log(`🏥 Detected Provisioning Request: ${provisioningId}`);

                    // A. Idempotency Check
                    const [request] = await db.select().from(clinicProvisioningRequests).where(eq(clinicProvisioningRequests.id, provisioningId)).limit(1);

                    if (!request) {
                        console.error(`❌ Provisioning Request ${provisioningId} not found`);
                        return c.json({ error: 'Provisioning Request not found' }, 404);
                    }

                    if (request.status === 'provisioned' || request.status === 'paid') {
                        console.log(`⚠️ Request ${provisioningId} already processed (Status: ${request.status})`);
                        return c.json({ received: true });
                    }

                    // B. Mark as PAID immediately (for race conditions)
                    await db.update(clinicProvisioningRequests).set({ status: 'paid' }).where(eq(clinicProvisioningRequests.id, provisioningId));

                    if (request.mode === 'user_upgrade') {
                        // === USER UPGRADE FLOW ===
                        console.log(`👤 Processing User Upgrade for ${clerkUserId}`);

                        // 1. Update User Plan
                        await db.update(users)
                            .set({
                                planType: request.planType || 'dentis_pro',
                                stripeCustomerId: customerId
                            })
                            .where(eq(users.clerkId, clerkUserId));

                        // 2. Create Subscription Record
                        await db.insert(subscriptions).values({
                            userId: clerkUserId,
                            stripeCustomerId: customerId,
                            stripeSubscriptionId: session.subscription as string,
                            planType: request.planType || 'dentis_pro',
                            status: 'active',
                        });

                        // 3. Finalize Provisioning Request
                        await db.update(clinicProvisioningRequests).set({
                            status: 'provisioned',
                        }).where(eq(clinicProvisioningRequests.id, provisioningId));

                        console.log(`🎉 User Upgrade Provisioning Complete!`);

                    } else {
                        // === CLINIC CREATION FLOW ===
                        // C. Create Clerk Organization
                        let clerkOrg;
                        try {
                            const clinicName = metadata.desiredName || `Clínica de ${user.name}`;
                            clerkOrg = await clerkClient.organizations.createOrganization({
                                name: clinicName,
                                createdBy: clerkUserId,
                            });
                            console.log(`✅ Clerk Org Created: ${clerkOrg.id}`);
                        } catch (e: any) {
                            console.error('❌ Failed to create Clerk Org', e);
                            throw e;
                        }

                        // D. Create DB Clinic Record
                        const clinicId = clerkOrg.id;
                        await db.insert(clinics).values({
                            id: clinicId,
                            clerkOrganizationId: clerkOrg.id,
                            name: clerkOrg.name,
                            seats: Number(metadata.seats || 1),
                            planType: metadata.planType || 'clinic_id',
                            stripeCustomerId: customerId,
                            subscriptionId: session.subscription as string,
                        });

                        // E. Create Membership Record 
                        // Note: Clerk 'createdBy' already adds the user. But we need it in our DB 'clinic_memberships'
                        // Let's use the Clerk ID for `dentistId` to be safe/consistent with `organization_members` if that's the pattern.
                        // Re-checking `organization_members`: "userId: text('user_id').notNull()".
                        // Most likely it stores the User's CLERK ID or the User's DB ID as string.
                        // Given `users.clerkId` is unique text, and `users.id` is serial.
                        // Let's look at `organizationMembersRelations`: it references `users.id`.
                        // So `users.id` (int) is being stored as text in `organization_members`?
                        // Let's coerce user.id to string.
                        await db.insert(clinicMemberships).values({
                            clinicId: clinicId,
                            dentistId: user.id.toString(),
                            role: 'owner',
                        });

                        // Update User in Clerk to match role limits/metadata? (Optional)

                        // F. Finalize Provisioning Request
                        await db.update(clinicProvisioningRequests).set({
                            status: 'provisioned',
                            clerkOrganizationId: clerkOrg.id
                        }).where(eq(clinicProvisioningRequests.id, provisioningId));

                        console.log(`🎉 Clinic Provisioning Complete!`);
                    }
                }
                // === END PROVISIONING ===

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
