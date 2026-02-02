import { Hono } from 'hono';
import { db } from '../db';
import { users, inventory, procedures } from '../db/schema';

const debug = new Hono();

debug.get('/dump', async (c) => {
  try {
    // Busca tudo o que existe no banco (sem filtrar por usuário)
    const allUsers = await db.select().from(users);
    const allItems = await db.select().from(inventory);
    const allProcs = await db.select().from(procedures);

    return c.json({
      status: 'online',
      counts: {
        users: allUsers.length,
        inventory: allItems.length,
        procedures: allProcs.length
      },
      data: {
        users: allUsers,
        inventorySample: allItems.slice(0, 5), 
        proceduresSample: allProcs.slice(0, 5)
      }
    });
  } catch (error: any) {
    return c.json({ error: error.message, stack: error.stack }, 500);
  }
});

export default debug;
