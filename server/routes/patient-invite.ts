import { Hono } from 'hono';
import { authMiddleware } from '../middleware/auth';
import { patients, patientInvitations } from '../db/schema';
import { db } from '../db';
import { eq, and, gt } from 'drizzle-orm';
import { randomBytes } from 'crypto';
import { authRateLimit } from '../middleware/rateLimit';

const app = new Hono();
app.use('*', authMiddleware);

// Generate unique invitation token
function generateToken(): string {
    return randomBytes(32).toString('base64url');
}

// POST /api/patient-invite/create
// Creates an invitation link for a patient
app.post('/create', async (c) => {
    try {
        const auth = c.get('auth');
        const { patientId } = await c.req.json();

        if (!patientId) {
            return c.json({ error: 'Patient ID required' }, 400);
        }

        // Get patient data
        const patient = await db.query.patients.findFirst({
            where: and(
                eq(patients.id, patientId),
                eq(patients.organizationId, auth.organizationId)
            ),
        });

        if (!patient) {
            return c.json({ error: 'Patient not found' }, 404);
        }

        // Check if patient already has a user account
        if (patient.userId) {
            return c.json({
                error: 'Patient already has an account',
                hasAccount: true
            }, 400);
        }

        // Generate token
        const token = generateToken();

        // Set expiration to 7 days from now
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);

        // Prepare pre-filled data
        const prefilledData = {
            patientId: patient.id,
            name: patient.name,
            email: patient.email || '',
            phone: patient.phone || '',
            cpf: patient.cpf || '',
        };

        // Create invitation
        try {
            const [invitation] = await db.insert(patientInvitations).values({
                organizationId: auth.organizationId,
                patientId: patient.id,
                token,
                prefilledData,
                expiresAt,
                createdBy: auth.userId,
            }).returning();

            // Generate invitation link
            const baseUrl = process.env.VITE_APP_URL || 'http://localhost:3000';
            const invitationLink = `${baseUrl}/register/${token}`;

            return c.json({
                success: true,
                token,
                invitationLink,
                expiresAt,
                patient: {
                    id: patient.id,
                    name: patient.name,
                },
            });
        } catch (dbError: any) {
            throw dbError;
        }

    } catch (error: any) {
        console.error('Error creating invitation:', error);
        return c.json({
            error: 'Failed to create invitation',
            details: error.message
        }, 500);
    }
});

// GET /api/patient-invite/:token
// GET /api/patient-invite/:token
// Validates and returns pre-filled data for registration
app.get('/:token', authRateLimit, async (c) => {
    try {
        const token = c.req.param('token');

        if (!token) {
            return c.json({ error: 'Token required' }, 400);
        }

        // Find invitation
        const invitation = await db.query.patientInvitations.findFirst({
            where: eq(patientInvitations.token, token),
            with: {
                patient: true,
            },
        });

        if (!invitation) {
            return c.json({ error: 'Invalid invitation token' }, 404);
        }

        // Check if already used
        if (invitation.usedAt) {
            return c.json({
                error: 'Invitation already used',
                used: true
            }, 400);
        }

        // Check if expired
        if (new Date() > new Date(invitation.expiresAt)) {
            return c.json({
                error: 'Invitation expired',
                expired: true
            }, 400);
        }

        // Return pre-filled data (without sensitive info)
        return c.json({
            valid: true,
            prefilledData: invitation.prefilledData,
            expiresAt: invitation.expiresAt,
        });

    } catch (error: any) {
        console.error('Error validating invitation:', error);
        return c.json({
            error: 'Failed to validate invitation',
            details: error.message
        }, 500);
    }
});

// POST /api/patient-invite/:token/accept
// POST /api/patient-invite/:token/accept
// Marks invitation as used and links patient to user
app.post('/:token/accept', authRateLimit, async (c) => {
    try {
        const token = c.req.param('token');
        const { clerkUserId } = await c.req.json();

        if (!token || !clerkUserId) {
            return c.json({ error: 'Token and Clerk user ID required' }, 400);
        }

        // Find invitation
        const invitation = await db.query.patientInvitations.findFirst({
            where: eq(patientInvitations.token, token),
        });

        if (!invitation) {
            return c.json({ error: 'Invalid invitation' }, 404);
        }

        if (invitation.usedAt) {
            return c.json({ error: 'Invitation already used' }, 400);
        }

        if (new Date() > new Date(invitation.expiresAt)) {
            return c.json({ error: 'Invitation expired' }, 400);
        }

        // Mark as used
        await db.update(patientInvitations)
            .set({ usedAt: new Date() })
            .where(eq(patientInvitations.id, invitation.id));

        // Link patient to user
        await db.update(patients)
            .set({ userId: clerkUserId })
            .where(eq(patients.id, invitation.patientId));

        return c.json({
            success: true,
            patientId: invitation.patientId,
            message: 'Account linked successfully',
        });

    } catch (error: any) {
        console.error('Error accepting invitation:', error);
        return c.json({
            error: 'Failed to accept invitation',
            details: error.message
        }, 500);
    }
});

export default app;
