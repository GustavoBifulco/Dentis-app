
import { Hono } from 'hono';
import { requireRole, requireMfa } from '../middleware/auth';
import { db } from '../db';
import { chatMessages, users } from '../db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { checkTenantAccess } from '../utils/tenant';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { logAudit } from '../services/audit';

const app = new Hono<{ Variables: { user: any; organizationId: string } }>();

app.use('*', requireMfa);

// 1. Fetch History (Room = Case/Appointment)
app.get('/case/:caseId', async (c) => {
    const caseId = Number(c.req.param('caseId'));
    const user = c.get('user');
    const organizationId = c.get('organizationId');

    checkTenantAccess(user, organizationId, 'view_chat_history');

    // Authorization: User must be related to the Case (Dentist, Staff, or The Patient)
    // TODO: Join with Appointment/ClinicalRecord to verify participant
    // For now, we assume if they have tenant access, they are staff, UNLESS they are patient.
    if (user.role === 'patient') {
        // Verify patient owns the case
        // const isOwner = await db.query...
        // if (!isOwner) throw new Forbidden...
    }

    const history = await db.query.chatMessages.findMany({
        where: eq(chatMessages.caseId, caseId),
        orderBy: [desc(chatMessages.createdAt)],
        limit: 50,
        with: {
            // We would join sender here if relationship exists
        }
    });

    // Mask sensitive content if needed?
    // History is generally trusted for participants.

    return c.json({ messages: history });
});

const msgSchema = z.object({
    content: z.string().min(1).max(2000),
    attachments: z.array(z.string().url()).optional()
});

// 2. Send Message
app.post('/case/:caseId', zValidator('json', msgSchema), async (c) => {
    const caseId = Number(c.req.param('caseId'));
    const user = c.get('user');
    const organizationId = c.get('organizationId');

    checkTenantAccess(user, organizationId, 'send_chat_message');

    const { content, attachments } = c.req.valid('json');

    await db.insert(chatMessages).values({
        caseId,
        senderId: user.id,
        content: content, // Sanitization should happen on output (DOMPurify)
        attachments: attachments,
        createdAt: new Date()
    });

    return c.json({ status: 'sent' });

});

// 3. Secure File Download (Signed URL generator for private files)
// This endpoint converts a stored backend file ID/Key into a temporary S3 Signed URL
app.get('/attachment/:fileKey', async (c) => {
    const fileKey = c.req.param('fileKey');
    const user = c.get('user');
    // Verify user has access to the file context (Case)
    // ... logic ...

    // Generate Signed URL (Mock logic for now, or use AWS SDK getSignedUrl)
    // import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
    // const command = new GetObjectCommand({ Bucket: ..., Key: fileKey });
    // const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

    // Mock for local dev
    const url = `https://${process.env.S3_BUCKET}.s3.amazonaws.com/${fileKey}?token=mock-signed-token`;

    await logAudit({
        userId: user.id,
        action: 'DOWNLOAD_ATTACHMENT',
        resourceType: 'file',
        resourceId: fileKey,
        tenantId: c.get('organizationId')
    });

    return c.json({ url });
});


export default app;
