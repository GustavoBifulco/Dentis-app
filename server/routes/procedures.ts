import { Hono } from 'hono';
import { procedures } from '../db/schema';
import { scopedDb } from '../db/scoped';
import { authMiddleware } from '../middleware/auth';
import { seedDefaultData } from '../services/seedData';

const app = new Hono();

app.use('*', authMiddleware);

app.get('/', async (c) => {
  const auth = c.get('auth');
  const scoped = scopedDb(c);
  let list = await scoped.select(procedures);

  // SEED ON READ: Se vazio, popula e busca de novo
  if (list.length === 0 && auth.organizationId) {
    console.log(`Procedures empty for ${auth.organizationId}. Triggering Seed-On-Read.`);
    try {
      await seedDefaultData(auth.organizationId);
      list = await scoped.select(procedures);
    } catch (e) {
      console.error("Seed-On-Read failed:", e);
    }
  }

  return c.json(list);
});

export default app;
