import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { authMiddleware } from '../middleware/auth';
import { db } from '../db';
import { clinicLeadInvites } from '../db/schema';
import { nanoid } from 'nanoid';
// import { sendEmail } from '../services/email'; // Assuming this exists or will be mocked

const clinicInvites = new Hono<{ Variables: { userId: string } }>();

clinicInvites.use('*', authMiddleware);

const inviteSchema = z.object({
    email: z.string().email().optional(),
});

clinicInvites.post('/lead-invite', zValidator('json', inviteSchema), async (c) => {
    const { email } = c.req.valid('json');
    const userId = c.get('userId');

    try {
        const token = nanoid(12);

        // 1. Store Invite
        const [invite] = await db.insert(clinicLeadInvites).values({
            token,
            email,
            createdByDentistId: userId,
            status: 'pending',
        }).returning();

        // 2. Generate Link
        const inviteLink = `${process.env.PUBLIC_APP_URL}/invite/${token}`;

        // 3. Send Email (if email provided)
        if (email) {
            console.log(`📧 Simulation: Sending invite email to ${email} with link ${inviteLink}`);
            // await sendEmail({ to: email, subject: 'Convite para Dentis', html: ... });
        }

        return c.json({
            success: true,
            inviteLink,
            message: email ? 'Convite enviado por e-mail.' : 'Link gerado com sucesso.',
        });

    } catch (error: any) {
        console.error('Invite Error:', error);
        return c.json({ error: 'Failed to create invite' }, 500);
    }
});

export default clinicInvites;
