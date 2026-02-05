
import { Hono } from 'hono';
import { db } from '../db';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';
import { authMiddleware } from '../middleware/auth';

const app = new Hono();
app.use('*', authMiddleware);

app.patch('/', async (c) => {
    const auth = c.get('auth');
    const { theme, primaryColor } = await c.req.json();

    if (!auth.userId) {
        return c.json({ error: 'Unauthorized' }, 401);
    }

    // Update user preferences
    // We assume the user exists because of authMiddleware
    // Need to merge with existing preferences or just overwrite? 
    // Let's overwrite for now as these are the only prefs.

    // First fetch existing to merge if needed in future
    const [user] = await db.select().from(users).where(eq(users.id, auth.userId));

    if (!user) {
        return c.json({ error: 'User not found' }, 404);
    }

    const currentPrefs = (user.preferences as any) || {};
    const newPrefs = {
        ...currentPrefs,
        ...(theme ? { theme } : {}),
        ...(primaryColor ? { primaryColor } : {})
    };

    await db.update(users)
        .set({ preferences: newPrefs })
        .where(eq(users.id, auth.userId));

    return c.json({ success: true, preferences: newPrefs });
});

export default app;
