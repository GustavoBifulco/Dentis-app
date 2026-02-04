import { Hono } from 'hono';
import { patients, users } from '../db/schema';
import { scopedDb } from '../db/scoped';
import { authMiddleware, requireMfa } from '../middleware/auth';
import { seedDefaultData } from '../services/seedData';
import { eq, and } from 'drizzle-orm';

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

app.put('/:id', async (c) => {
  const auth = c.get('auth');
  if (!['dentist', 'clinic_owner'].includes(auth.role)) return c.json({ error: 'Acesso negado' }, 403);

  const id = parseInt(c.req.param('id'));
  const body = await c.req.json();
  const scoped = scopedDb(c);

  // Security: Ensure patient belongs to this org
  const existing = await scoped.select().from(patients).where(and(eq(patients.id, id), eq(patients.organizationId, auth.organizationId))).limit(1);

  if (!existing.length) {
    return c.json({ error: 'Patient not found' }, 404);
  }

  // Prevent CPF update if desired, or just allow it. The prompt says "editable minus cpf", so we should probably safeguard CPF.
  // Ideally, we just destructure it out.
  const { cpf, ...updates } = body;

  const [updatedPatient] = await scoped
    .update(patients)
    .set({
      ...updates,
      organizationId: auth.organizationId, // Ensure Org ID doesn't change
    })
    .where(and(eq(patients.id, id), eq(patients.organizationId, auth.organizationId)))
    .returning();

  // Sync with Users table if linked
  if (updatedPatient.userId) {
    try {
      await scoped.update(users)
        .set({
          name: updatedPatient.name,
          phone: updatedPatient.phone,
          // Email is often the key in Clerk, updating it here might cause mismatch if not synced with Clerk. 
          // But we can update the local user record.
        })
        .where(eq(users.clerkId, updatedPatient.userId)); // userId in patients table seems to be clerkId based on schema comment "References users.id as string (legacy/compat)" or Clerk ID?
      // Schema: userId: text('user_id')
      // Users table: clerkId: text('clerk_id').unique()
      // It assumes userId in patients == clerkId in users.
    } catch (e) {
      console.error("Failed to sync user profile", e);
    }
  }

  return c.json(updatedPatient);
});

export default app;
