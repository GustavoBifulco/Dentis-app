import { Hono } from 'hono';
import { db } from '../db';
import { procedures } from '../db/schema';
import { eq } from 'drizzle-orm';

import { authMiddleware } from '../middleware/auth';

const app = new Hono<{ Variables: { organizationId: string } }>();
app.use('*', authMiddleware);

app.get('/', async (c) => {
  const organizationId = c.get('organizationId');
  const items = await db.select().from(procedures).where(eq(procedures.organizationId, organizationId));
  return c.json(items);
});

export default app;
