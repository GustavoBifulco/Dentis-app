
import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { db } from '../db';
import { clinicalRecords } from '../db/schema';
import { eq, desc, and } from 'drizzle-orm';
import { authMiddleware } from '../middleware/auth';

const app = new Hono<{ Variables: { organizationId: number; userId: number } }>();

app.use('*', authMiddleware);

const recordSchema = z.object({
  patientId: z.coerce.number(),
  type: z.enum(['ODONTOGRAM_STATE', 'EVOLUTION', 'PRESCRIPTION']),
  data: z.any(), // JSON estruturado
});

// GET /api/clinical/:patientId/odontogram
app.get('/:patientId/odontogram', async (c) => {
  const patientId = Number(c.req.param('patientId'));
  const organizationId = c.get('organizationId');

  const lastState = await db.query.clinicalRecords.findFirst({
    where: and(
      eq(clinicalRecords.patientId, patientId),
      eq(clinicalRecords.organizationId, organizationId),
      eq(clinicalRecords.type, 'ODONTOGRAM_STATE')
    ),
    orderBy: [desc(clinicalRecords.createdAt)]
  });

  return c.json({ ok: true, data: lastState?.data || null });
});

// POST /api/clinical
app.post('/', zValidator('json', recordSchema), async (c) => {
  const organizationId = c.get('organizationId');
  const dentistId = c.get('userId');
  const { patientId, type, data } = c.req.valid('json');

  const [newRecord] = await db.insert(clinicalRecords).values({
    organizationId,
    patientId,
    dentistId,
    type,
    data
  }).returning();

  return c.json({ ok: true, data: newRecord }, 201);
});

export default app;
