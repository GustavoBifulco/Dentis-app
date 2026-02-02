import { Hono } from 'hono';
import { db } from '../db';
import { users, procedures } from '../db/schema';

const debug = new Hono();

debug.get('/dump', async (c) => {
  try {
    // Busca dados do banco (sem inventory que foi removido)
    const allUsers = await db.select().from(users);
    const allProcs = await db.select().from(procedures);

    return c.json({
      status: 'online',
      counts: {
        users: allUsers.length,
        procedures: allProcs.length
      },
      data: {
        users: allUsers,
        proceduresSample: allProcs.slice(0, 5)
      }
    });
  } catch (error: any) {
    return c.json({ error: error.message, stack: error.stack }, 500);
  }
});

export default debug;
