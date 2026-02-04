import { Hono } from 'hono';
import { authMiddleware } from '../middleware/auth';
import { db } from '../db';
import { patients, appointments, labCases, inventory, accountsReceivable } from '../db/schema';
import { eq, sql, and, lt, desc } from 'drizzle-orm';

const dashboard = new Hono();

dashboard.use('*', authMiddleware);

dashboard.get('/stats', async (c) => {
    const auth = c.get('auth');
    // REMOVED: const scoped = scopedDb(c); -> Causing TypeError: scoped.select(...).from is not a function

    try {
        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];

        // 1. Clinical Stats
        const [todayAppts] = await db
            .select({ count: sql<number>`count(*)` })
            .from(appointments)
            .where(
                and(
                    eq(appointments.organizationId, auth.organizationId),
                    eq(appointments.scheduledDate, todayStr)
                )
            );

        // 2. Operations / Lab Stats (Overdue)
        const [overdueLabs] = await db
            .select({ count: sql<number>`count(*)` })
            .from(labCases)
            .where(
                and(
                    eq(labCases.organizationId, auth.organizationId),
                    lt(labCases.dueDate, today),
                    sql`${labCases.status} != 'delivered'`
                )
            );

        // 3. Low Stock Alerts
        const [lowStock] = await db
            .select({ count: sql<number>`count(*)` })
            .from(inventory)
            .where(
                and(
                    eq(inventory.organizationId, auth.organizationId),
                    sql`quantity <= min_quantity`
                )
            );

        // 4. Financial (Month Revenue Mock -> Real later)
        // For P2.4, we could return average margin, but let's stick to basics first.

        return c.json({
            userName: auth.userName || 'Doutor',
            appointmentsToday: Number(todayAppts?.count || 0),
            revenueMonth: 0, // Implement later with ledger
            alerts: {
                overdueLabs: Number(overdueLabs?.count || 0),
                lowStock: Number(lowStock?.count || 0),
                pendingTasks: 0
            },
            nextPatient: null, // TODO: Fetch next appt
            nextTime: null
        });

    } catch (error) {
        console.error('Dashboard Stats Error:', error);
        return c.json({ error: 'Failed to fetch stats' }, 500);
    }
});

// New Endpoint for Detailed Operations Widget
dashboard.get('/operations', async (c) => {
    const auth = c.get('auth');
    // const scoped = scopedDb(c);
    const today = new Date();

    try {
        // Get Low Stock Items
        const lowStockItems = await db
            .select()
            .from(inventory)
            .where(
                and(
                    eq(inventory.organizationId, auth.organizationId),
                    sql`quantity <= min_quantity`
                )
            )
            .limit(5);

        // Get Overdue Labs
        const delayedLabs = await db
            .select()
            .from(labCases)
            .where(
                and(
                    eq(labCases.organizationId, auth.organizationId),
                    lt(labCases.dueDate, today),
                    sql`${labCases.status} != 'delivered'`
                )
            )
            .limit(5);

        return c.json({
            lowStock: lowStockItems,
            delayedLabs: delayedLabs
        });

    } catch (error) {
        return c.json({ error: 'Failed to fetch ops' }, 500);
    }
});

export default dashboard;
