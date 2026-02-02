import { Hono } from 'hono';
import { db } from '../db';
import { procedures } from '../db/schema';
import { eq } from 'drizzle-orm';

const proceduresRouter = new Hono();

proceduresRouter.get('/', async (c) => {
  const userId = c.req.header('x-user-id');
  if (!userId) return c.json([]);
  const items = await db.select().from(procedures).where(eq(procedures.userId, userId));
  return c.json(items);
});

export default proceduresRouter;
