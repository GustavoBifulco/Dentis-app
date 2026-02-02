import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { db } from '../db';
import { appointments, procedures, financial } from '../db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { authMiddleware } from '../middleware/auth';

const app = new Hono<{ Variables: { organizationId: number, userId: number } }>();
app.use('*', authMiddleware);

const apptSchema = z.object({
  patientId: z.coerce.number(),
  procedureId: z.coerce.number().optional(), // ID do procedimento do catálogo
  procedureName: z.string().optional(),      // Texto livre se não usar catálogo
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  notes: z.string().optional()
});

// LIST
app.get('/', async (c) => {
  const organizationId = c.get('organizationId');
  const list = await db.query.appointments.findMany({
    where: eq(appointments.organizationId, organizationId),
    with: {
      patient: true,
      dentist: true
    },
    orderBy: [desc(appointments.startTime)]
  });
  return c.json({ ok: true, data: list });
});

// CREATE
app.post('/', zValidator('json', apptSchema), async (c) => {
  const organizationId = c.get('organizationId');
  const dentistId = c.get('userId');
  const data = c.req.valid('json');

  const result = await db.insert(appointments).values({
    organizationId,
    dentistId,
    patientId: data.patientId,
    procedureId: data.procedureId,
    procedureName: data.procedureName || 'Consulta',
    startTime: new Date(data.startTime),
    endTime: new Date(data.endTime),
    status: 'scheduled',
    notes: data.notes
  }).returning();

  return c.json({ ok: true, data: result[0] }, 201);
});

// COMPLETE & GENERATE FINANCE
app.patch('/:id/complete', async (c) => {
  const id = Number(c.req.param('id'));
  const organizationId = c.get('organizationId');

  if (isNaN(id)) return c.json({ error: 'ID inválido' }, 400);

  // 1. Atualizar Status
  const [updatedAppt] = await db.update(appointments)
    .set({ status: 'completed' })
    .where(and(eq(appointments.id, id), eq(appointments.organizationId, organizationId)))
    .returning();

  if (!updatedAppt) return c.json({ ok: false, error: 'Agendamento não encontrado' }, 404);

  // 2. Gerar Financeiro (Se houver procedureId vinculado com preço)
  if (updatedAppt.procedureId) {
    const proc = await db.query.procedures.findFirst({
      where: eq(procedures.id, updatedAppt.procedureId)
    });

    if (proc) {
      await db.insert(financial).values({
        organizationId,
        patientId: updatedAppt.patientId,
        appointmentId: updatedAppt.id,
        type: 'INCOME',
        description: `Procedimento: ${proc.name}`,
        amount: proc.price, // Valor do catálogo
        status: 'PENDING',
        dueDate: new Date(), // Vence hoje
        category: 'Tratamento'
      });
    }
  }

  return c.json({ ok: true, data: updatedAppt });
});

export default app;
