import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { db } from '../db';
import { patients } from '../db/schema';
import { eq, desc } from 'drizzle-orm';
import { authMiddleware } from '../middleware/auth';

const app = new Hono<{ Variables: { userId: number; organizationId: number } }>();

app.use('*', authMiddleware);

const patientSchema = z.object({
  name: z.string().min(3),
  cpf: z.string().optional(),
  phone: z.string().min(8),
  email: z.string().email().optional(),
});

// GET /api/patients
app.get('/', async (c) => {
  const organizationId = c.get('organizationId');
  try {
    const allPatients = await db.select().from(patients)
      .where(eq(patients.organizationId, organizationId))
      .orderBy(desc(patients.id));
    return c.json({ ok: true, data: allPatients });
  } catch (error: any) {
    console.error("Erro buscar pacientes:", error);
    return c.json({ ok: false, error: error.message }, 500);
  }
});

// POST /api/patients
app.post('/', zValidator('json', patientSchema), async (c) => {
  const organizationId = c.get('organizationId');
  const userId = c.get('userId');
  const data = c.req.valid('json') as { name: string; cpf?: string; phone: string; email?: string };
  try {
    const result = await db.insert(patients).values({ ...data, organizationId, userId }).returning();
    return c.json({ ok: true, data: result[0] }, 201);
  } catch (error: any) {
    console.error("Erro criar paciente:", error);
    return c.json({ ok: false, error: error.message }, 500);
  }
});

export default app;
