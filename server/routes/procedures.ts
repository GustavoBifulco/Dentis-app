import { Hono } from 'hono';
import { db } from '../db';
import { procedures } from '../db/schema';
import { eq } from 'drizzle-orm';

const proceduresRouter = new Hono();

proceduresRouter.get('/', async (c) => {
  const userIdRaw = c.req.header('x-user-id');
  if (!userIdRaw) return c.json([]);
  const userId = Number(userIdRaw);
  const items = await db.select().from(procedures).where(eq(procedures.userId, userId));
  return c.json(items);
});

export default proceduresRouter;
