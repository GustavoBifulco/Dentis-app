import { Hono } from 'hono';
import { db } from '../db';
import { invites, organizations, users } from '../db/schema';
import { eq, and } from 'drizzle-orm';
import { sendMessage } from '../services/whatsapp';
import { randomUUID } from 'crypto';

const invitesRoute = new Hono<{ Variables: { userId: string } }>();

// 1. Invite a Lab (Viral Loop Start)
invitesRoute.post('/lab', async (c) => {
    // Requires Auth (Dentist inviting)
    // Assuming authMiddleware is used in parent

    // Manual header check or trust middleware context
    // const userId = c.get('userId'); 

    const { labName, phone, dentistName, organizationId } = await c.req.json();

    if (!labName || !phone) return c.json({ error: 'Missing Data' }, 400);

    // a. Check if Lab exists (Simulated by name match for now, ideally phone match in users)
    // Since we don't store Phone in Organizations table as a unique key easily yet, let's search by name
    const [existingLab] = await db.select().from(organizations).where(and(eq(organizations.name, labName), eq(organizations.type, 'LAB')));

    if (existingLab) {
        // Already exists, just return (Frontend handles "Already connect?" logic)
        return c.json({ message: 'Lab already exists on platform', labId: existingLab.id });
    }

    // b. Create "Shadow Account"
    const [shadowLab] = await db.insert(organizations).values({
        name: labName,
        type: 'LAB',
        status: 'SHADOW', // Waiting for claim
        phone: phone,
        clerkOrgId: `shadow_${randomUUID()}` // Shadow accounts need a dummy clerk ID or handle null
    }).returning();

    // c. Generate Token
    const token = randomUUID();

    // d. Store Invite
    // Needs linking to an inviter user/clinic. 
    // If we don't have authenticated user context handy, we might need it passed or mock it.
    // Let's assume passed in body for the "Viral Loop" test
    const inviterUserId = 1; // MOCK or get from Context
    const inviterOrganizationId = organizationId || '1'; // Standardized naming and string

    await db.insert(invites).values({
        token,
        inviterOrganizationId,
        inviterUserId,
        invitedName: labName,
        invitedPhone: phone,
        targetOrganizationId: shadowLab.id,
        status: 'PENDING'
    });

    // e. Send WhatsApp
    const inviteLink = `https://dentis.app/invite/${token}`;
    const message = `Olá *${labName}*! A clínica *${dentistName || 'Parceira'}* enviou um novo trabalho protético via Dentis. Acesse para visualizar e receber o pedido: ${inviteLink}`;

    // Call WhatsApp Service (Async)
    sendMessage(phone, message).catch(err => console.error("WhatsApp Error", err));

    return c.json({ success: true, token, shadowLabId: shadowLab.id });
});

// 2. Accept Invite (Validate Token)
invitesRoute.get('/accept/:token', async (c) => {
    const token = c.req.param('token');

    const [invite] = await db.select().from(invites).where(eq(invites.token, token));

    if (!invite) return c.json({ error: 'Invalid Token' }, 404);
    if (invite.status !== 'PENDING') return c.json({ error: 'Invite expired or already accepted' }, 400);

    // Get Lab Details
    const [lab] = await db.select().from(organizations).where(eq(organizations.id, invite.targetOrganizationId));

    return c.json({
        valid: true,
        labName: lab.name,
        labId: lab.id,
        phone: invite.invitedPhone
    });
});

export default invitesRoute;
