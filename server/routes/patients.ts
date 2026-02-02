import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { db } from '../db';
import { patients } from '../db/schema';
import { eq, desc, and, ilike } from 'drizzle-orm';
import { authMiddleware } from '../middleware/auth';

const app = new Hono<{ Variables: { clinicId: string } }>();

app.use('*', authMiddleware);

// Schema Validator
const patientSchema = z.object({
  fullName: z.string().min(3),
  cpf: z.string().optional(),
  phone: z.string().min(8),
  email: z.string().email().optional(),
});

// GET /api/patients
app.get('/', async (c) => {
  const clinicId = c.get('clinicId');
  const allPatients = await db.query.patients.findMany({
    where: eq(patients.clinicId, clinicId),
    orderBy: [desc(patients.createdAt)],
  });
  return c.json({ ok: true, data: allPatients });
});

// POST /api/patients
app.post('/', zValidator('json', patientSchema), async (c) => {
  const clinicId = c.get('clinicId');
  const data = c.req.valid('json');

  const result = await db.insert(patients).values({
    ...data,
    clinicId,
  }).returning();

  return c.json({ ok: true, data: result[0] }, 201);
});

export default app;