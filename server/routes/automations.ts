import { Hono } from 'hono';
import { automationRules, automationLogs } from '../db/schema';
import { scopedDb } from '../db/scoped';
import { authMiddleware } from '../middleware/auth';
import { eq, desc } from 'drizzle-orm';

const app = new Hono();

app.use('*', authMiddleware);

// LIST Rules
app.get('/', async (c) => {
    const auth = c.get('auth');
    const scoped = scopedDb(c);

    try {
        const rules = await scoped.select()
            .from(automationRules)
            .where(eq(automationRules.organizationId, auth.organizationId))
            .orderBy(desc(automationRules.createdAt));

        return c.json(rules);
    } catch (error) {
        console.error('List Automations Error:', error);
        return c.json({ error: 'Failed to fetch rules' }, 500);
    }
});

// CREATE Rule
app.post('/', async (c) => {
    const auth = c.get('auth');
    const scoped = scopedDb(c);
    const body = await c.req.json();

    try {
        const [rule] = await scoped.insert(automationRules).values({
            organizationId: auth.organizationId,
            name: body.name,
            isActive: body.isActive ?? true,
            triggerType: body.triggerType,
            triggerConfig: body.triggerConfig || {},
            actionType: body.actionType,
            actionConfig: body.actionConfig || {},
        }).returning();

        return c.json(rule);
    } catch (error) {
        console.error('Create Automation Error:', error);
        return c.json({ error: 'Failed to create rule' }, 500);
    }
});

// DELETE Rule
app.delete('/:id', async (c) => {
    const id = parseInt(c.req.param('id'));
    const scoped = scopedDb(c);

    try {
        await scoped.delete(automationRules).where(eq(automationRules.id, id));
        return c.json({ success: true });
    } catch (error) {
        return c.json({ error: 'Failed to delete rule' }, 500);
    }
});

// MOCK TRIGGER (Testing)
app.post('/:id/trigger', async (c) => {
    const id = parseInt(c.req.param('id'));
    const auth = c.get('auth');
    const scoped = scopedDb(c);

    try {
        // Log "execution"
        await scoped.insert(automationLogs).values({
            organizationId: auth.organizationId,
            ruleId: id,
            status: 'success',
            details: 'Manually triggered via API',
            refType: 'manual_test',
            refId: '0'
        });

        // Update Last Run
        await scoped.update(automationRules)
            .set({ lastRunAt: new Date() })
            .where(eq(automationRules.id, id));

        return c.json({ success: true, message: 'Automation triggered successfully' });
    } catch (error) {
        return c.json({ error: 'Trigger failed' }, 500);
    }
});

export default app;
