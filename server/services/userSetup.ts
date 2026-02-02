import { db } from '../db';
import { users, organizations, organizationMembers, professionalProfiles, patientProfiles } from '../db/schema';
import { eq } from 'drizzle-orm';

export const setupNewUserEnvironment = async (
    clerkId: string,
    role: string,
    force: boolean = false,
    clerkOrgId?: string,
    clinicName?: string,
    userName?: string,
    email?: string,
    cpf?: string
) => {
    try {
        console.log(`Setting up environment for user ${clerkId} (Role: ${role})`);

        // 1. Upsert User
        const existingUsers = await db.select().from(users).where(eq(users.clerkId, clerkId)).limit(1);
        let userRecord = existingUsers[0];

        if (!userRecord) {
            const [newUser] = await db.insert(users).values({
                clerkId,
                email: email || null,
                name: userName || null,
                cpf: cpf || null,
                onboardingComplete: true
            }).returning();
            userRecord = newUser;
        } else {
            // Update existing user
            await db.update(users)
                .set({
                    onboardingComplete: true,
                    cpf: cpf || userRecord.cpf || null,
                    name: userName || userRecord.name || null
                })
                .where(eq(users.id, userRecord.id));
        }

        // 2. Setup Profile based on Role
        // Always create a patient profile (personal portal) for every user
        await db.insert(patientProfiles).values({
            userId: userRecord.id,
        }).onConflictDoNothing();

        // Create professional profile only for dentists/owners
        if (role === 'dentist' || role === 'clinic_owner') {
            await db.insert(professionalProfiles).values({
                userId: userRecord.id,
                type: role.toUpperCase(),
            }).onConflictDoNothing();
        }

        // 3. Setup Organization if provided
        if (clerkOrgId && clinicName) {
            let org = await db.query.organizations.findFirst({
                where: eq(organizations.clerkOrgId, clerkOrgId)
            });

            if (!org) {
                const [newOrg] = await db.insert(organizations).values({
                    clerkOrgId,
                    name: clinicName,
                }).returning();
                org = newOrg;
            }

            // Add member
            await db.insert(organizationMembers).values({
                userId: userRecord.id,
                organizationId: org.id,
                role: 'ADMIN'
            }).onConflictDoNothing();
        }

        return { success: true };
    } catch (error: any) {
        console.error('Error during setupNewUserEnvironment:', error);
        return { success: false, message: error.message };
    }
};
