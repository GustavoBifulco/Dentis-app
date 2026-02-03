import { Hono } from 'hono';
import { authMiddleware } from '../middleware/auth';
import { db } from '../db';
import { users, organizationMembers, organizations } from '../db/schema';
import { eq } from 'drizzle-orm';
import { clerkClient } from '@clerk/clerk-sdk-node';
import { UserRole } from '../../types';

const session = new Hono<{ Variables: { user: any } }>();

session.use('*', authMiddleware);

session.get('/', async (c) => {
    const userCtx = c.get('user');
    if (!userCtx || !userCtx.id) {
        return c.json({ error: 'Unauthorized' }, 401);
    }
    const userId = userCtx.id;
    const clerkId = userCtx.clerkId;

    const [user] = await db.select().from(users).where(eq(users.id, userId));

    if (!user) {
        return c.json({ error: 'User not found' }, 404);
    }

    // Get user's organizations from Clerk
    const clerkOrgs = await clerkClient.users.getOrganizationMembershipList({
        userId: clerkId,
    });

    const availableContexts: any[] = [];

    // professional profile
    const prof = await db.query.professionalProfiles.findFirst({
        where: (p, { eq }) => eq(p.userId, userId)
    });

    if (prof) {
        availableContexts.push({
            type: 'CLINIC',
            id: userId,
            name: user.name || 'Minha Clínica',
        });
    }

    // organizations
    const memberships = await db.select({
        org: organizations
    })
        .from(organizationMembers)
        .innerJoin(organizations, eq(organizationMembers.organizationId, organizations.id))
        .where(eq(organizationMembers.userId, userId));

    for (const m of memberships) {
        availableContexts.push({
            type: m.org.type === 'LAB' ? 'LAB' : 'CLINIC',
            id: m.org.id,
            name: m.org.name,
            organizationId: String(m.org.id)
        });
    }

    // patient profile
    const patient = await db.query.patientProfiles.findFirst({
        where: (p, { eq }) => eq(p.userId, userId)
    });

    if (patient) {
        availableContexts.push({
            type: 'PATIENT',
            id: patient.id,
            name: user.name || 'Meu Portal',
        });
    }

    const activeContext = availableContexts.length > 0 ? availableContexts[0] : null;

    const userSession = {
        user: {
            id: clerkId,
            email: user.email || '',
            name: user.name || '',
            role: user.role || UserRole.DENTIST,
        },
        capabilities: {
            isOrgAdmin: user.role === 'clinic_owner' || user.role === 'admin',
            isHealthProfessional: user.role === 'dentist' || user.role === 'clinic_owner',
            isCourier: user.role === 'courier',
            isPatient: user.role === 'patient' || !!patient,
        },
        availableContexts,
        activeContext,
        onboardingComplete: !!user.onboardingComplete,
        activeOrganization: activeContext?.organizationId ? { id: activeContext.organizationId } : null,
        orgRole: 'admin'
    };

    return c.json({ session: userSession });
});

export default session;
