
import { Hono } from 'hono';
import { z } from 'zod';
import { scopedDb } from '../db/scoped';
import { authMiddleware } from '../middleware/auth';
import { whatsappAutomationRules, whatsappMessageTemplates, whatsappCampaigns } from '../db/schema';
import { eq, and } from 'drizzle-orm';

const app = new Hono();
app.use('*', authMiddleware);

// --- AUTOMATION RULES ---

app.get('/automations', async (c) => {
    const auth = c.get('auth');
    const scoped = scopedDb(c);

    // Determine Owner (Organization or Personal)
    // If auth.organizationId starts with 'personal-', treat as 'dentist' owner
    // Otherwise 'clinic'
    const isPersonal = auth.organizationId.startsWith('personal-');
    const ownerType = isPersonal ? 'dentist' : 'clinic';
    const ownerId = isPersonal ? auth.userId : auth.organizationId; // For personal, owner is user

    const rules = await scoped.select().from(whatsappAutomationRules)
        .where(and(
            eq(whatsappAutomationRules.ownerType, ownerType),
            eq(whatsappAutomationRules.ownerId, ownerId)
        ));
    return c.json(rules);
});

app.post('/automations', async (c) => {
    const auth = c.get('auth');
    const scoped = scopedDb(c);
    const body = await c.req.json();

    const isPersonal = auth.organizationId.startsWith('personal-');
    const ownerType = isPersonal ? 'dentist' : 'clinic';
    const ownerId = isPersonal ? auth.userId : auth.organizationId;

    const [newItem] = await scoped.insert(whatsappAutomationRules).values({
        ...body,
        ownerType,
        ownerId
    }).returning();

    return c.json(newItem);
});

app.patch('/automations/:id', async (c) => {
    const auth = c.get('auth');
    const scoped = scopedDb(c);
    const id = parseInt(c.req.param('id'));
    const body = await c.req.json();

    const [updated] = await scoped.update(whatsappAutomationRules)
        .set({ ...body, updatedAt: new Date() })
        .where(eq(whatsappAutomationRules.id, id))
        .returning();

    return c.json(updated);
});

// --- CAMPAIGNS ---

app.get('/campaigns', async (c) => {
    const auth = c.get('auth');
    const scoped = scopedDb(c);

    const isPersonal = auth.organizationId.startsWith('personal-');
    const ownerType = isPersonal ? 'dentist' : 'clinic';
    const ownerId = isPersonal ? auth.userId : auth.organizationId;

    const list = await scoped.select().from(whatsappCampaigns)
        .where(and(
            eq(whatsappCampaigns.ownerType, ownerType),
            eq(whatsappCampaigns.ownerId, ownerId)
        ));
    return c.json(list);
});

app.post('/campaigns', async (c) => {
    const auth = c.get('auth');
    const scoped = scopedDb(c);
    const body = await c.req.json();

    const isPersonal = auth.organizationId.startsWith('personal-');
    const ownerType = isPersonal ? 'dentist' : 'clinic';
    const ownerId = isPersonal ? auth.userId : auth.organizationId;

    const [newItem] = await scoped.insert(whatsappCampaigns).values({
        ...body,
        ownerType,
        ownerId,
        status: 'draft'
    }).returning();

    return c.json(newItem);
});


export default app;
