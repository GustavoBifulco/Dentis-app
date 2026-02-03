import { Hono } from 'hono';
import { db } from '../db';
import { orders, organizations, patients } from '../db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { authMiddleware } from '../middleware/auth';
import { validateCoupon, validatePrice } from '../services/marketplace';

const ordersRoute = new Hono<{ Variables: { organizationId: string; userId: string } }>();

ordersRoute.use('*', authMiddleware);

/**
 * GET /api/orders
 * Fetch all orders for the current clinic
 */
ordersRoute.get('/', async (c) => {
    const organizationId = c.get('organizationId');

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
    const organizationId = c.get('organizationId');
    const userId = c.get('userId');

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
        itemId, // ID form Catalog
        couponCode // Optional Coupon
    } = await c.req.json();

    // SERVER SIDE PRICE VALIDATION
    let finalPrice = 0;

    if (itemId) {
        // Enforce Catalog Price
        const item = await validatePrice(itemId, 0); // Second arg is ignored if we just fetch
        finalPrice = parseFloat(item.price);
    }

    if (couponCode) {
        const coupon = await validateCoupon(couponCode, userId);
        if (coupon.type === 'PERCENT') {
            finalPrice = finalPrice * (1 - coupon.value / 100);
        } else {
            finalPrice = Math.max(0, finalPrice - coupon.value);
        }
    }

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
        status: 'requested',
        isDigital: !!isDigital,
        stlFileUrl,
        price: finalPrice.toString(),
        subtotal: finalPrice.toString(),
        deadline: deadline ? new Date(deadline) : null,
        paymentStatus: 'PENDING',
    }).returning();

    return c.json({ success: true, order: newOrder });
});

export default ordersRoute;
