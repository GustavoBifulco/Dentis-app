import { Hono } from 'hono';
import { db } from '../db';
import { shipments } from '../db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { logTimelineEvent } from '../services/timeline';

const app = new Hono<{ Variables: { user: any; organizationId: string } }>();

app.get('/', async (c) => {
    const organizationId = c.get('organizationId');
    const items = await db.select().from(shipments)
        .where(eq(shipments.organizationId, organizationId))
        .orderBy(desc(shipments.createdAt));
    return c.json(items);
});

app.post('/', async (c) => {
    const organizationId = c.get('organizationId');
    const user = c.get('user');
    const body = await c.req.json();

    const [newItem] = await db.insert(shipments).values({
        organizationId,
        trackingCode: body.trackingCode,
        provider: body.provider,
        status: 'created',
        refType: body.refType,
        refId: body.refId,
        metadata: body.metadata
    }).returning();

    logTimelineEvent({
        organizationId,
        patientId: body.patientId, // Optional, implies shipments are linked to patients usually
        eventType: 'logistic',
        refType: 'shipment',
        refId: String(newItem.id),
        title: `Remessa Criada: ${body.provider}`,
        summary: body.trackingCode,
        createdBy: user.id
    });

    return c.json(newItem);
});

export default app;
