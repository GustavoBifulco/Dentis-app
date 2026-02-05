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

    // 1. Fetch Professional Profile (Core Identity)
    const prof = await db.query.professionalProfiles.findFirst({
        where: (p, { eq }) => eq(p.userId, userId)
    });

    // 2. Fetch Organizations (Memberships)
    const memberships = await db.select({
        org: organizations,
        role: organizationMembers.role
    })
        .from(organizationMembers)
        .innerJoin(organizations, eq(organizationMembers.organizationId, organizations.id))
        .where(eq(organizationMembers.userId, userId));

    // 3. Construct Contexts with Deduplication
    const personalOrgId = `personal-${clerkId}`; // Standard Personal Workspace ID

    // Check if we have a membership for the personal org
    const personalMembership = memberships.find(m => m.org.id === personalOrgId || m.org.id === `personal-${userId}`);
    const otherMemberships = memberships.filter(m => m.org.id !== personalOrgId && m.org.id !== `personal-${userId}`);

    // A. Personal Context (Always first if exists)
    if (prof || personalMembership) {
        availableContexts.push({
            type: 'CLINIC', // Treating Personal Workspace as a Clinic context for now (schema compatibility)
            // Ideally we differentiate 'PERSONAL' vs 'CLINIC' in UI, but backend treats as org.
            // UI Label will be "Conta Pessoal"
            id: personalMembership?.org.id || personalOrgId,
            name: 'Conta Pessoal', // Fixed name for personal context
            organizationId: personalMembership?.org.id || personalOrgId,
            isPersonal: true
        });
    }

    // B. Other Clinics (Real Organizations)
    for (const m of otherMemberships) {
        availableContexts.push({
            type: m.org.type === 'LAB' ? 'LAB' : 'CLINIC',
            id: m.org.id,
            name: m.org.name,
            organizationId: String(m.org.id),
            isPersonal: false
        });
    }

    // C. Patient Context (Separate)
    const patient = await db.query.patientProfiles.findFirst({
        where: (p, { eq }) => eq(p.userId, userId)
    });

    if (patient) {
        availableContexts.push({
            type: 'PATIENT',
            id: patient.id,
            name: 'Meu Portal',
            organizationId: null // Patients don't have an org context generally
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
        orgRole: 'admin',
        preferences: (user.preferences as any) || {}
    };

    return c.json({ session: userSession });
});

export default session;
