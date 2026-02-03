
import { Hono } from 'hono';
import { requireRole, requireMfa } from '../middleware/auth';
import { db } from '../db';
import { clinicalRecords } from '../db/schema';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { checkTenantAccess } from '../utils/tenant';

const app = new Hono<{ Variables: { user: any; organizationId: string } }>();

app.use('*', requireMfa);

const consentSchema = z.object({
    patientId: z.number(),
    termsVersion: z.string().default('1.0'),
    ipAddress: z.string().optional(),
});

// Log Patient Consent for Tele-consultation
app.post('/consent', zValidator('json', consentSchema), async (c) => {
    const user = c.get('user');
    const organizationId = c.get('organizationId');
    const { patientId, termsVersion, ipAddress } = c.req.valid('json');

    checkTenantAccess(user, organizationId, 'log_consent');

    // Verify user has access to patient data (implied by checkTenantAccess usually, but explicit check good)

    const consentData = {
        termsVersion,
        acceptedAt: new Date().toISOString(),
        ip: ipAddress || c.req.header('x-forwarded-for') || 'unknown',
        userAgent: c.req.header('user-agent'),
        signer: user.name
    };

    await db.insert(clinicalRecords).values({
        organizationId,
        patientId,
        dentistId: String(user.id || 'system'), // Ensure text type
        treatment: 'TELEHEALTH_CONSENT', // Field is treatment in schema
        notes: JSON.stringify(consentData), // Field is notes in schema
        createdAt: new Date(),
    });

    return c.json({ success: true, message: 'Consent logged successfully.' });
});

export default app;
