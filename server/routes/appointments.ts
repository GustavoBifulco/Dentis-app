import { Hono } from 'hono';
import { appointments } from '../db/schema';
import { scopedDb } from '../db/scoped';
import { requireMfa } from '../middleware/auth';
import { eq } from 'drizzle-orm';

const app = new Hono();

app.get('/me', requireMfa, async (c) => {
  const auth = c.get('auth');
  const scoped = scopedDb(c);

  let list;
  if (auth.role === 'dentist') {
    list = await scoped.select().from(appointments);
  } else if (auth.role === 'patient') {
    list = await scoped.select().from(appointments).where(eq(appointments.patientId, auth.userId));
  } else {
    return c.json({ error: 'Acesso negado' }, 403);
  }

  return c.json(list);
});

export default app;
