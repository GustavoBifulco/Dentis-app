import { Hono } from 'hono';
import { db } from '../db';
import { inventory } from '../db/schema';
import { eq } from 'drizzle-orm';

const inventoryRouter = new Hono();

inventoryRouter.get('/', async (c) => {
  const userId = c.req.header('x-user-id');
  
  // LOG DE DEBUG: Vamos ver no terminal quem está pedindo os dados
  console.log(`🔍 [Inventory API] Buscando estoque para ID: [${userId}]`);

  if (!userId) {
    console.warn("⚠️ [Inventory API] Requisição sem x-user-id!");
    return c.json([]);
  }

  try {
    const items = await db.select().from(inventory).where(eq(inventory.userId, userId));
    console.log(`✅ [Inventory API] Retornando ${items.length} itens.`);
    return c.json(items);
  } catch (error) {
    console.error("❌ [Inventory API] Erro no banco:", error);
    return c.json([]);
  }
});

export default inventoryRouter;
