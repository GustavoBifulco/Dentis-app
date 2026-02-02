import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { db } from '../db';
import { patients } from '../db/schema';
import { eq, desc } from 'drizzle-orm';
import { authMiddleware } from '../middleware/auth';

const app = new Hono<{ Variables: { userId: string } }>();

app.use('*', authMiddleware);

const patientSchema = z.object({
  name: z.string().min(3),
  cpf: z.string().optional(),
  phone: z.string().min(8),
  email: z.string().email().optional(),
});

// GET /api/patients
app.get('/', async (c) => {
  const userId = c.get('userId');
  try {
    const allPatients = await db.select().from(patients)
      .where(eq(patients.userId, userId))
      .orderBy(desc(patients.id));
    return c.json({ ok: true, data: allPatients });
  } catch (error: any) {
    console.error("Erro buscar pacientes:", error);
    return c.json({ ok: false, error: error.message }, 500);
  }
});

// POST /api/patients
app.post('/', zValidator('json', patientSchema), async (c) => {
  const userId = c.get('userId');
  const data = c.req.valid('json');
  try {
    const result = await db.insert(patients).values({ ...data, userId }).returning();
    return c.json({ ok: true, data: result[0] }, 201);
  } catch (error: any) {
    console.error("Erro criar paciente:", error);
    return c.json({ ok: false, error: error.message }, 500);
  }
});

export default app;
