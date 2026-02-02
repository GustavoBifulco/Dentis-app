import { Hono } from 'hono';
import { db } from '../db';
import { orders, organizations, patients } from '../db/schema';
import { eq, and, sql, desc } from 'drizzle-orm';
import { authMiddleware } from '../middleware/auth';

import type { UserSession } from '../../types';

const labRoute = new Hono<{ Variables: { organizationId: number; userId: number; session: UserSession } }>();

// Apply auth middleware to all routes
labRoute.use('*', authMiddleware);

/**
 * GET /api/lab/dashboard
 * Fetch lab-specific dashboard statistics
 */
labRoute.get('/dashboard', async (c) => {
    const session = c.get('session');

    if (!session?.activeOrganization) {
        return c.json({ error: 'No active organization' }, 400);
    }

    const labId = session.activeOrganization.id;

    // Count orders by status
    const statusCounts = await db
        .select({
            status: orders.status,
            count: sql<number>`count(*)::int`,
        })
        .from(orders)
        .where(eq(orders.labId, labId))
        .groupBy(orders.status);

    // Calculate revenue metrics
    const revenueData = await db
        .select({
            totalRevenue: sql<string>`COALESCE(SUM(CAST(${orders.subtotal} AS DECIMAL)), 0)`,
            paidRevenue: sql<string>`COALESCE(SUM(CASE WHEN ${orders.paymentStatus} = 'PAID' THEN CAST(${orders.subtotal} AS DECIMAL) ELSE 0 END), 0)`,
            pendingRevenue: sql<string>`COALESCE(SUM(CASE WHEN ${orders.paymentStatus} = 'PENDING' THEN CAST(${orders.subtotal} AS DECIMAL) ELSE 0 END), 0)`,
        })
        .from(orders)
        .where(eq(orders.labId, labId));

    const stats = {
        pending: statusCounts.find(s => s.status === 'PENDING')?.count || 0,
        inProduction: statusCounts.find(s => s.status === 'IN_PRODUCTION')?.count || 0,
        ready: statusCounts.find(s => s.status === 'READY')?.count || 0,
        delivered: statusCounts.find(s => s.status === 'DELIVERED')?.count || 0,
        totalRevenue: parseFloat(revenueData[0]?.totalRevenue || '0'),
        paidRevenue: parseFloat(revenueData[0]?.paidRevenue || '0'),
        pendingRevenue: parseFloat(revenueData[0]?.pendingRevenue || '0'),
    };

    return c.json({ stats });
});

/**
 * GET /api/lab/orders
 * Fetch all orders for the lab with optional status filter
 */
labRoute.get('/orders', async (c) => {
    const session = c.get('session');
    const statusFilter = c.req.query('status');

    if (!session?.activeOrganization) {
        return c.json({ error: 'No active organization' }, 400);
    }

    const labId = session.activeOrganization.id;

    const conditions = [eq(orders.labId, labId)];
    if (statusFilter) {
        conditions.push(eq(orders.status, statusFilter));
    }

    const labOrders = await db
        .select({
            id: orders.id,
            description: orders.description,
            status: orders.status,
            price: orders.price,
            subtotal: orders.subtotal,
            deliveryFee: orders.deliveryFee,
            paymentStatus: orders.paymentStatus,
            deadline: orders.deadline,
            createdAt: orders.createdAt,
            clinicName: organizations.name,
            patientName: patients.name,
        })
        .from(orders)
        .leftJoin(organizations, eq(orders.organizationId, organizations.id))
        .leftJoin(patients, eq(orders.patientId, patients.id))
        .where(and(...conditions))
        .orderBy(desc(orders.createdAt));

    return c.json({
        orders: labOrders.map(order => ({
            id: order.id,
            description: order.description,
            status: order.status,
            price: order.price,
            subtotal: order.subtotal,
            deliveryFee: order.deliveryFee,
            paymentStatus: order.paymentStatus,
            deadline: order.deadline,
            createdAt: order.createdAt,
            clinic: order.clinicName,
            patient: order.patientName,
        }))
    });
});

/**
 * PATCH /api/lab/orders/:id/status
 * Update order status (for kanban drag-and-drop)
 */
labRoute.patch('/orders/:id/status', async (c) => {
    const session = c.get('session');
    const orderId = parseInt(c.req.param('id'));
    const { status } = await c.req.json();

    if (!session?.activeOrganization) {
        return c.json({ error: 'No active organization' }, 400);
    }

    const validStatuses = ['PENDING', 'IN_PRODUCTION', 'READY', 'IN_TRANSIT', 'DELIVERED'];
    if (!validStatuses.includes(status)) {
        return c.json({ error: 'Invalid status' }, 400);
    }

    // Verify order belongs to this lab
    const [order] = await db
        .select()
        .from(orders)
        .where(
            and(
                eq(orders.id, orderId),
                eq(orders.labId, session.activeOrganization.id)
            )
        );

    if (!order) {
        return c.json({ error: 'Order not found or unauthorized' }, 404);
    }

    // Update status
    const [updated] = await db
        .update(orders)
        .set({ status })
        .where(eq(orders.id, orderId))
        .returning();

    return c.json({
        success: true,
        order: {
            id: updated.id,
            status: updated.status,
        }
    });
});

export default labRoute;
