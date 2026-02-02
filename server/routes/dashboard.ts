import { Hono } from 'hono';
import { authMiddleware } from '../middleware/auth';
import { db } from '../db';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';
import { clerkClient } from '@clerk/clerk-sdk-node';

/**
 * Dashboard Route - Simplified for Login
 * 
 * This has been simplified to allow login to work.
 * The old version used legacy schema and needs complete rewrite.
 * 
 * TODO: Implement proper dashboard stats after completing migration
 */

const dashboard = new Hono<{ Variables: { userId: string, clerkId: string } }>();

dashboard.use('*', authMiddleware);

dashboard.get('/stats', async (c) => {
    const userId = Number(c.get('userId'));
    const clerkId = c.get('clerkId');

    const [user] = await db.select().from(users).where(eq(users.id, userId));

    if (!user) {
        return c.json({ error: 'User not found' }, 404);
    }

    // Get user's organizations from Clerk
    const clerkOrgs = await clerkClient.users.getOrganizationMembershipList({
        userId: clerkId,
    });

    // Construct availableContexts based on user's profiles and organizations
    const availableContexts: any[] = [];

    // Check for professional profile (Dentist)
    const professionalProfile = await db.query.professionalProfiles.findFirst({
        where: (profiles, { eq }) => eq(profiles.userId, userId),
    });

    // Check for courier profile
    const courierProfile = await db.query.courierProfiles.findFirst({
        where: (profiles, { eq }) => eq(profiles.userId, userId),
    });

    // Check for patient profile
    const patientProfile = await db.query.patientProfiles.findFirst({
        where: (profiles, { eq }) => eq(profiles.userId, userId),
    });

    // Add contexts based on profiles
    if (professionalProfile) {
        availableContexts.push({
            type: 'CLINICAL',
            label: 'Dashboard Clínico',
        });
    }

    if (courierProfile) {
        availableContexts.push({
            type: 'COURIER',
            label: 'App de Entregas',
        });
    }

    if (patientProfile) {
        availableContexts.push({
            type: 'PATIENT',
            label: 'Meu Tratamento',
        });
    }

    // Add organization-based contexts
    for (const orgMembership of clerkOrgs.data) {
        const org = await db.query.organizations.findFirst({
            where: (orgs, { eq }) => eq(orgs.clerkOrgId, orgMembership.organization.id),
        });

        if (org) {
            if (org.type === 'LAB') {
                availableContexts.push({
                    type: 'LAB',
                    label: org.name,
                    organizationId: org.id,
                });
            } else if (org.type === 'CLINIC') {
                availableContexts.push({
                    type: 'CLINICAL',
                    label: org.name,
                    organizationId: org.id,
                });
            } else if (org.type === 'SUPPLIER') {
                availableContexts.push({
                    type: 'SUPPLIER',
                    label: org.name,
                    organizationId: org.id,
                });
            }
        }
    }

    return c.json({
        stats: {
            availableContexts,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
            },
        },
    });
});

export default dashboard;
