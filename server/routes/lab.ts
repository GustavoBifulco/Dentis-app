import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { db } from '../db';
import { labCases } from '../db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { logTimelineEvent } from '../services/timeline';
import { authMiddleware } from '../middleware/auth';

const app = new Hono<{ Variables: { user: any; auth: any; organizationId: string } }>();

app.use('*', authMiddleware);

const labCaseSchema = z.object({
    patientId: z.number(),
    laboratoryName: z.string(),
    type: z.string(),
    description: z.string().optional(),
    dueDate: z.string().optional(),
    price: z.number().optional(),
});

// GET /api/lab
app.get('/', async (c) => {
    const organizationId = c.get('organizationId');
    const cases = await db.select().from(labCases)
        .where(eq(labCases.organizationId, organizationId))
        .orderBy(desc(labCases.createdAt));
    return c.json(cases);
});

// POST /api/lab (Create OS)
app.post('/', zValidator('json', labCaseSchema), async (c) => {
    const organizationId = c.get('organizationId');
    const user = c.get('user');
    const body = c.req.valid('json');

    const [newCase] = await db.insert(labCases).values({
        organizationId,
        patientId: body.patientId,
        laboratoryName: body.laboratoryName,
        type: body.type,
        description: body.description,
        dueDate: body.dueDate ? new Date(body.dueDate) : null,
        price: body.price ? String(body.price) : null,
        status: 'planned'
    } as any).returning();

    logTimelineEvent({
        organizationId,
        patientId: body.patientId,
        eventType: 'lab',
        refType: 'lab_case',
        refId: String(newCase.id),
        title: `OS de Laboratório Criada`,
        summary: `${body.type} - ${body.laboratoryName}`,
        createdBy: user.id
    });

    return c.json(newCase);
});

// PUT /api/lab/:id/status (Send/Receive)
app.put('/:id/status', async (c) => {
    const id = Number(c.req.param('id'));
    const organizationId = c.get('organizationId');
    const user = c.get('user');
    const { status } = await c.req.json();

    const [updated] = await db.update(labCases)
        .set({
            status,
            updatedAt: new Date(),
            sentDate: status === 'sent' ? new Date() : undefined,
            receivedDate: status === 'received' ? new Date() : undefined
        })
        .where(and(eq(labCases.id, id), eq(labCases.organizationId, organizationId)))
        .returning();

    if (updated) {
        logTimelineEvent({
            organizationId,
            patientId: updated.patientId,
            eventType: 'lab',
            refType: 'lab_case',
            refId: String(id),
            title: `Laboratório: ${status.toUpperCase()}`,
            createdBy: user.id
        });
    }

    return c.json(updated);
});

export default app;
