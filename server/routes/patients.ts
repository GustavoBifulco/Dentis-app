import { Hono } from 'hono';
import { patients } from '../db/schema';
import { scopedDb } from '../db/scoped';
import { authMiddleware, requireMfa } from '../middleware/auth';
import { seedDefaultData } from '../services/seedData';

const app = new Hono();

// Auth deve vir PRIMEIRO para popular user/auth
app.use('*', authMiddleware);
// MFA vem depois (opcional, se ativado)
app.use('*', requireMfa);

app.get('/', async (c) => {
  const auth = c.get('auth');
  if (!['dentist', 'clinic_owner'].includes(auth.role)) return c.json({ error: 'Acesso negado' }, 403);

  const scoped = scopedDb(c);
  let list = await scoped.select(patients);

  // SEED ON READ: Garantia final de que o usuário terá dados
  if (list.length === 0 && auth.organizationId) {
    console.log(`Patients list empty for ${auth.organizationId}. Triggering Seed-On-Read.`);
    try {
      await seedDefaultData(auth.organizationId);
      // Recarregar lista após seed
      list = await scoped.select(patients);
    } catch (err) {
      console.error("Seed-On-Read failed:", err);
    }
  }

  return c.json(list);
});

app.post('/', async (c) => {
  const auth = c.get('auth');
  if (!['dentist', 'clinic_owner'].includes(auth.role)) return c.json({ error: 'Acesso negado' }, 403);

  const body = await c.req.json();
  const scoped = scopedDb(c);
  const [newPatient] = await scoped.insert(patients).values({
    ...body,
    organizationId: auth.organizationId,
  }).returning();

  return c.json(newPatient, 201);
});

export default app;
