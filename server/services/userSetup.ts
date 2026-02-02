import { db } from '../db';
import { users, procedures, organizations, organizationMembers } from '../db/schema';
import { eq } from 'drizzle-orm';

/**
 * LEGACY ONBOARDING SERVICE - TEMPORARILY DISABLED
 * 
 * This file uses the old schema structure and needs to be updated to work with the new schema.
 * For now, we're using the seed script (server/db/seed.ts) to create test users and data.
 * 
 * TODO: Update this service to use the new schema when onboarding is needed again:
 * - Replace `clinics` with `organizations`
 * - Replace `clinicMembers` with `organizationMembers`
 * - Remove `inventory` (table no longer exists)
 * - Update `procedures` schema (changed fields: organizationId, durationMinutes)
 * - Update `users` schema (removed `role`, `profileData` fields)
 */

export const setupNewUserEnvironment = async (
    clerkId: string,
    role: string,
    force: boolean = false,
    clerkOrgId?: string,
    clinicName?: string,
    userName?: string,
    email?: string
) => {
    console.warn('⚠️ setupNewUserEnvironment is temporarily disabled. Please use the seed script (npm run db:seed) to create test users.');
    return {
        success: false,
        message: 'Onboarding service is temporarily disabled. Use seed script instead.',
    };
};
