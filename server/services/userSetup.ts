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
    cpf?: string,
    phone?: string,
    cro?: string
) => {
    try {
        console.log(`Setting up environment for user ${clerkId} (Role: ${role})`);

        // 1. Upsert User
        const existingUsers = await db.select().from(users).where(eq(users.clerkId, clerkId)).limit(1);
        let userRecord = existingUsers[0];

        if (!userRecord) {
            const [newUser] = await db.insert(users).values({
                clerkId,
                role,
                email: email || null,
                name: userName || "Novo Usuário",
                cpf: cpf || null,
                phone: phone || null,
                onboardingComplete: new Date()
            }).returning();
            userRecord = newUser;
        } else {
            // Update existing user
            await db.update(users)
                .set({
                    role: role, // Always update role
                    onboardingComplete: new Date(),
                    cpf: cpf || userRecord.cpf || null,
                    phone: phone || userRecord.phone || null,
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
                cro: cro || null,
            }).onConflictDoNothing();
        }

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
