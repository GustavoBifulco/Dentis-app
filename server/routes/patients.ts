import { Hono } from 'hono';
import { patients } from '../db/schema';
import { scopedDb } from '../db/scoped';
import { requireMfa } from '../middleware/auth';

const app = new Hono();

app.get('/', requireMfa, async (c) => {
  const auth = c.get('auth');
  if (auth.role !== 'dentist') return c.json({ error: 'Acesso negado' }, 403);

  const scoped = scopedDb(c);
  const list = await scoped.select().from(patients);
  return c.json(list);
});

app.post('/', requireMfa, async (c) => {
  const auth = c.get('auth');
  if (auth.role !== 'dentist') return c.json({ error: 'Acesso negado' }, 403);

  const body = await c.req.json();
  const scoped = scopedDb(c);
  const [newPatient] = await scoped.insert(patients).values({
    ...body,
    organizationId: auth.organizationId,
  }).returning();

  return c.json(newPatient, 201);
});

export default app;
