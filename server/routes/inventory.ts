import { Hono } from 'hono';
import { db } from '../db';
import { inventory } from '../db/schema';
import { eq } from 'drizzle-orm';

const inventoryRouter = new Hono();

inventoryRouter.get('/', async (c) => {
  const userId = c.req.header('x-user-id');
  if (!userId) return c.json([]);
  // Usando a propriedade correta mapeada pelo Drizzle
  const items = await db.select().from(inventory).where(eq(inventory.userId, userId));
  return c.json(items);
});

export default inventoryRouter;
