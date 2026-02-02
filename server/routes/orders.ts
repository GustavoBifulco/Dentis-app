import { Hono } from 'hono';
import { db } from '../db';
import { orders, organizations, patients } from '../db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { authMiddleware } from '../middleware/auth';

const ordersRoute = new Hono<{ Variables: { organizationId: number; userId: number } }>();

ordersRoute.use('*', authMiddleware);

/**
 * GET /api/orders
 * Fetch all orders for the current clinic
 */
ordersRoute.get('/', async (c) => {
    const organizationId = Number(c.get('organizationId'));

    if (!organizationId) {
        return c.json({ error: 'Organization ID not found in context' }, 400);
    }

    const clinicOrders = await db
        .select({
            id: orders.id,
            patientName: patients.name,
            procedure: orders.description,
            status: orders.status,
            deadline: orders.deadline,
            cost: orders.price,
            isDigital: orders.isDigital,
            stlFileUrl: orders.stlFileUrl,
            labName: organizations.name,
        })
        .from(orders)
        .leftJoin(patients, eq(orders.patientId, patients.id))
        .leftJoin(organizations, eq(orders.labId, organizations.id))
        .where(eq(orders.organizationId, organizationId))
        .orderBy(desc(orders.createdAt));

    return c.json({ orders: clinicOrders });
});

/**
 * POST /api/orders
 * Create a new lab order
 */
ordersRoute.post('/', async (c) => {
    const organizationId = Number(c.get('organizationId'));
    const userId = Number(c.get('userId'));

    if (!organizationId || !userId) {
        return c.json({ error: 'Incomplete authentication context' }, 400);
    }

    const {
        patientName,
        procedure,
        labId,
        isDigital,
        stlFileUrl,
        description,
        deadline,
        price
    } = await c.req.json();

    if (!patientName || !procedure) {
        return c.json({ error: 'Patient name and procedure are required' }, 400);
    }

    // 1. Find or create patient
    let patientId: number;
    const [existingPatient] = await db
        .select()
        .from(patients)
        .where(and(eq(patients.name, patientName), eq(patients.organizationId, organizationId)));

    if (existingPatient) {
        patientId = existingPatient.id;
    } else {
        const [newPatient] = await db.insert(patients).values({
            name: patientName,
            organizationId: organizationId,
        }).returning();
        patientId = newPatient.id;
    }

    // 2. Create order
    const [newOrder] = await db.insert(orders).values({
        organizationId: organizationId,
        labId: labId ? parseInt(labId) : null,
        dentistId: userId,
        patientId,
        description: procedure + (description ? `: ${description}` : ''),
        status: 'requested', // Matches Kanban column ID in Labs.tsx
        isDigital: !!isDigital,
        stlFileUrl,
        price: price ? price.toString() : '0',
        subtotal: price ? price.toString() : '0',
        deadline: deadline ? new Date(deadline) : null,
        paymentStatus: 'PENDING',
    }).returning();

    return c.json({ success: true, order: newOrder });
});

export default ordersRoute;
