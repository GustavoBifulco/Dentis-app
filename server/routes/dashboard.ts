import { Hono } from 'hono';
import { authMiddleware } from '../middleware/auth';
import { db } from '../db';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';

const dashboard = new Hono<{ Variables: { user: any } }>();

dashboard.use('*', authMiddleware);

dashboard.get('/stats', async (c) => {
    const userCtx = c.get('user');
    if (!userCtx || !userCtx.id) {
        return c.json({ error: 'Unauthorized' }, 401);
    }
    const userId = userCtx.id;
    const [user] = await db.select().from(users).where(eq(users.id, userId));

    if (!user) {
        return c.json({ error: 'User not found' }, 404);
    }

    // Return the structure expected by ClinicalDashboard.tsx
    return c.json({
        userName: user.name || '',
        appointmentsToday: 0,
        revenueMonth: 0,
        nextPatient: null,
        nextTime: null,
        needsSetup: false
    });
});

export default dashboard;
