import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { db } from '../db';
import { appointments, clinics, patients } from '../db/schema';
import { and, desc, eq, gte, lte, or } from 'drizzle-orm';

const app = new Hono();

const checkinSchema = z.object({
  cpf: z.string().min(8),
  kioskToken: z.string().optional(),
});

app.post('/checkin', zValidator('json', checkinSchema), async (c) => {
  const { cpf, kioskToken } = c.req.valid('json');
  const cpfDigits = cpf.replace(/\D/g, '');

  let clinicId: number | null = null;
  if (kioskToken) {
    const clinic = await db.query.clinics.findFirst({
      where: eq(clinics.kioskToken, kioskToken),
    });

    if (!clinic) {
      return c.json({ ok: false, error: 'Kiosk token invalido' }, 401);
    }
    clinicId = clinic.id;
  }

  const patient = await db.query.patients.findFirst({
    where: clinicId
      ? and(
        eq(patients.clinicId, clinicId),
        or(eq(patients.cpf, cpfDigits), eq(patients.cpf, cpf))
      )
      : or(eq(patients.cpf, cpfDigits), eq(patients.cpf, cpf)),
  });

  if (!patient) {
    return c.json({ ok: false, error: 'Paciente nao encontrado' }, 404);
  }

  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);

  const appointment = await db.query.appointments.findFirst({
    where: and(
      eq(appointments.patientId, patient.id),
      gte(appointments.startTime, start),
      lte(appointments.startTime, end)
    ),
    orderBy: [desc(appointments.startTime)],
    with: { dentist: true },
  });

  if (!appointment) {
    return c.json({
      ok: true,
      data: {
        patient,
        appointment: null,
        message: 'Nenhum agendamento para hoje',
      },
    });
  }

  const [updated] = await db
    .update(appointments)
    .set({ status: 'arrived' })
    .where(eq(appointments.id, appointment.id))
    .returning();

  return c.json({
    ok: true,
    data: {
      patient,
      appointment: updated || appointment,
    },
  });
});

export default app;
