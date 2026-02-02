
import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { authMiddleware } from '../middleware/auth';
import { db } from '../db'; // Assuming db export exists in ../db/index.ts
import { users, organizations } from '../db/schema';
import { eq } from 'drizzle-orm';
import { clerkClient } from '@clerk/clerk-sdk-node';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2023-10-16',
});

const profile = new Hono<{ Variables: { userId: number; clerkId: string; role: string; organizationId: number } }>();

profile.use('*', authMiddleware);

profile.get('/me', async (c) => {
    const userId = c.get('userId'); // Ensure userId is number from authMiddleware? Or string?
    // authMiddleware usually sets 'userId' as the DB ID (number) and 'clerkId' as string.
    // Let's verify authMiddleware, but assuming standard flow.
    // In previous context: c.set('userId', user.id); user.id is serial (number).
    // So userId is number.

    // Fetch DB User
    const [dbUser] = await db.select().from(users).where(eq(users.id, Number(userId)));
    if (!dbUser) return c.json({ error: 'User not found' }, 404);

    // Fetch Clinic if needed (for owner)
    let clinicData = null;
    if (dbUser.role === 'clinic_owner') {
        // Only if linked? Or find by owner?
        // Usually via clinicMembers, but let's see if we can find by clerkOrgId or similar if stored in users?
        // No, users table doesn't have clinicId. logic is in clinicMembers usually.
        // But 'onboarding' puts clinicId in context if available.
        // Let's assume we fetch the first clinic they own for the profile page.
        // For now, simpler: Return what we have in DB User.
    }

    // Fetch Clerk Data
    let clerkUser;
    try {
        clerkUser = await clerkClient.users.getUser(dbUser.clerkId);
    } catch (e) {
        console.error("Clerk Fetch Error", e);
    }

    // Fetch Stripe Data
    let stripeCustomer;
    if (dbUser.email) {
        const customers = await stripe.customers.search({
            query: `email:\'${dbUser.email}\'`,
            limit: 1
        });
        stripeCustomer = customers.data[0];
    }

    // Aggregate Data
    const profileData = dbUser.profileData as any || {};

    return c.json({
        firstName: clerkUser?.firstName || dbUser.name?.split(' ')[0] || '',
        lastName: clerkUser?.lastName || dbUser.surname || '',
        email: dbUser.email || '',
        phone: dbUser.profileData && (dbUser.profileData as any).phone ? (dbUser.profileData as any).phone : (clerkUser?.phoneNumbers?.[0]?.phoneNumber || ''),
        cpf: (dbUser.profileData as any)?.cpf || '',
        birthDate: (dbUser.profileData as any)?.birthDate || '',
        address: (dbUser.profileData as any)?.address || { street: '', number: '', neighborhood: '', city: '', state: '' },
        // Clinic Data
        companyName: (dbUser.profileData as any)?.companyName || '',
        cnpj: (dbUser.profileData as any)?.cnpj || '',
        technicalManager: (dbUser.profileData as any)?.technicalManager || '',

        // Meta
        role: dbUser.role,
        stripeStatus: stripeCustomer ? 'active' : 'none' // Simplified
    });
});

const updateSchema = z.object({
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    phone: z.string().optional(),
    birthDate: z.string().optional(),
    address: z.any().optional(), // Validate shape deeper if needed
    // Clinic
    companyName: z.string().optional(),
    cnpj: z.string().optional(),
    technicalManager: z.string().optional(),
});

profile.put('/update', zValidator('json', updateSchema), async (c) => {
    const data = c.req.valid('json');
    const userId = Number(c.get('userId'));
    const clerkId = c.get('clerkId');

    // 1. Update Clerk (Name)
    try {
        await clerkClient.users.updateUser(clerkId, {
            firstName: data.firstName,
            lastName: data.lastName,
            // Phone?? Updating phone in Clerk sends SMS OTP usually. Better NOT update phone in Clerk directly via API unless verified.
            // We store phone in DB profileData primarily for contact.
        });
    } catch (e) {
        console.error("Clerk Update Error", e);
    }

    // 2. Update DB
    // Fetch current profile data to merge
    const [currentUser] = await db.select().from(users).where(eq(users.id, userId));
    const currentProfile = currentUser?.profileData as any || {};

    const newProfileData = {
        ...currentProfile,
        phone: data.phone,
        birthDate: data.birthDate,
        address: data.address,
        companyName: data.companyName,
        cnpj: data.cnpj,
        technicalManager: data.technicalManager
    };

    await db.update(users).set({
        name: data.firstName, // Simple name
        surname: data.lastName,
        profileData: newProfileData
    }).where(eq(users.id, userId));

    // 3. Update Stripe (if customer exists)
    if (currentUser?.email) {
        try {
            const customers = await stripe.customers.search({ query: `email:\'${currentUser.email}\'`, limit: 1 });
            if (customers.data.length > 0) {
                await stripe.customers.update(customers.data[0].id, {
                    name: `${data.firstName} ${data.lastName}`,
                    phone: data.phone,
                    address: {
                        line1: data.address?.street + ', ' + data.address?.number,
                        city: data.address?.city,
                        state: data.address?.state,
                        country: 'BR' // Assume BR
                    }
                });
            }
        } catch (e) {
            console.error("Stripe Update Error", e);
        }
    }

    return c.json({ success: true });
});

export default profile;
