import { Hono } from 'hono';
import { appointments, appointmentSettings, appointmentRequests, patients, procedures, inventoryMovements } from '../db/schema';
import { scopedDb } from '../db/scoped';
import { db } from '../db';
import { authMiddleware } from '../middleware/auth';
import { eq, and, gte, lte, desc, sql } from 'drizzle-orm';

const app = new Hono();

app.use('*', authMiddleware);

// GET /api/appointments - List all appointments
app.get('/', async (c) => {
  const auth = c.get('auth');
  const scoped = scopedDb(c);

  const { date, status, patient_id, start_date, end_date } = c.req.query();

  let conditions = [];

  if (date) {
    conditions.push(eq(appointments.scheduledDate, date));
  }
  if (start_date && end_date) {
    conditions.push(
      and(
        gte(appointments.scheduledDate, start_date),
        lte(appointments.scheduledDate, end_date)
      )
    );
  }
  if (status) {
    conditions.push(eq(appointments.status, status));
  }
  if (patient_id) {
    conditions.push(eq(appointments.patientId, parseInt(patient_id)));
  }

  // Ensure manual OrgID filtering for complex joins
  conditions.push(eq(appointments.organizationId, auth.organizationId));

  const query = db
    .select({
      appointment: appointments,
      patient: patients,
      procedure: procedures,
    })
    .from(appointments)
    .leftJoin(patients, eq(appointments.patientId, patients.id))
    .leftJoin(procedures, eq(appointments.procedureId, procedures.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(appointments.scheduledDate, appointments.scheduledTime);

  const list = await query;

  return c.json(list.map(row => ({
    ...row.appointment,
    patient: row.patient,
    procedure: row.procedure,
  })));
});

// GET /api/appointments/:id - Get single appointment
app.get('/:id', async (c) => {
  const id = parseInt(c.req.param('id'));
  const scoped = scopedDb(c);

  const [result] = await db
    .select({
      appointment: appointments,
      patient: patients,
      procedure: procedures,
    })
    .from(appointments)
    .leftJoin(patients, eq(appointments.patientId, patients.id))
    .leftJoin(procedures, eq(appointments.procedureId, procedures.id))
    .where(and(
      eq(appointments.id, id),
      eq(appointments.organizationId, c.get('auth').organizationId)
    ));

  if (!result) {
    return c.json({ error: 'Appointment not found' }, 404);
  }

  return c.json({
    ...result.appointment,
    patient: result.patient,
    procedure: result.procedure,
  });
});

// POST /api/appointments - Create appointment
app.post('/', async (c) => {
  const auth = c.get('auth');
  const scoped = scopedDb(c);
  const body = await c.req.json();

  try {
    const [newAppointment] = await scoped.insert(appointments).values({
      organizationId: auth.organizationId,
      patientId: body.patient_id,
      dentistId: auth.userId,
      scheduledDate: body.scheduled_date,
      scheduledTime: body.scheduled_time,
      duration: body.duration || 60,
      appointmentType: body.appointment_type || 'consulta',
      procedureId: body.procedure_id || null,
      notes: body.notes || null,
      chiefComplaint: body.chief_complaint || null,
      isFollowup: body.is_followup || false,
      parentAppointmentId: body.parent_appointment_id || null,
      notifyPatient: body.notify_patient !== false,
      confirmationRequired: body.confirmation_required !== false,
    }).returning();

    return c.json(newAppointment, 201);
  } catch (error: any) {
    console.error('Error creating appointment:', error);
    return c.json({ error: 'Failed to create appointment' }, 500);
  }
});

// PUT /api/appointments/:id - Update appointment
app.put('/:id', async (c) => {
  const id = parseInt(c.req.param('id'));
  const scoped = scopedDb(c);
  const body = await c.req.json();

  try {
    const updateData: any = {
      updatedAt: new Date(),
    };

    if (body.scheduled_date) updateData.scheduledDate = body.scheduled_date;
    if (body.scheduled_time) updateData.scheduledTime = body.scheduled_time;
    if (body.duration) updateData.duration = body.duration;
    if (body.status) updateData.status = body.status;
    if (body.appointment_type) updateData.appointmentType = body.appointment_type;
    if (body.procedure_id !== undefined) updateData.procedureId = body.procedure_id;
    if (body.notes !== undefined) updateData.notes = body.notes;
    if (body.chief_complaint !== undefined) updateData.chiefComplaint = body.chief_complaint;

    const [updated] = await scoped
      .update(appointments)
      .set(updateData)
      .where(eq(appointments.id, id))
      .returning();

    if (!updated) {
      return c.json({ error: 'Appointment not found' }, 404);
    }

    return c.json(updated);
  } catch (error: any) {
    console.error('Error updating appointment:', error);
    return c.json({ error: 'Failed to update appointment' }, 500);
  }
});

// DELETE /api/appointments/:id - Cancel appointment
app.delete('/:id', async (c) => {
  const id = parseInt(c.req.param('id'));
  const scoped = scopedDb(c);
  const body = await c.req.json();

  try {
    const [cancelled] = await scoped
      .update(appointments)
      .set({
        status: 'cancelled',
        cancelledAt: new Date(),
        cancellationReason: body.cancellation_reason || 'Cancelado',
        updatedAt: new Date(),
      })
      .where(eq(appointments.id, id))
      .returning();

    if (!cancelled) {
      return c.json({ error: 'Appointment not found' }, 404);
    }

    return c.json({ success: true, appointment: cancelled });
  } catch (error: any) {
    console.error('Error cancelling appointment:', error);
    return c.json({ error: 'Failed to cancel appointment' }, 500);
  }
});

// POST /api/appointments/:id/confirm - Confirm appointment
app.post('/:id/confirm', async (c) => {
  const id = parseInt(c.req.param('id'));
  const scoped = scopedDb(c);
  const body = await c.req.json();

  try {
    const [confirmed] = await scoped
      .update(appointments)
      .set({
        status: 'confirmed',
        confirmedAt: new Date(),
        confirmedBy: body.confirmed_by || 'app',
        updatedAt: new Date(),
      })
      .where(eq(appointments.id, id))
      .returning();

    if (!confirmed) {
      return c.json({ error: 'Appointment not found' }, 404);
    }

    return c.json(confirmed);
  } catch (error: any) {
    console.error('Error confirming appointment:', error);
    return c.json({ error: 'Failed to confirm appointment' }, 500);
  }
});

// POST /api/appointments/:id/complete - Mark as completed & Deduct Inventory
app.post('/:id/complete', async (c) => {
  const id = parseInt(c.req.param('id'));
  const auth = c.get('auth');
  const scoped = scopedDb(c);

  try {
    // 1. Get Appointment with Procedure
    const [apt] = await db.select().from(appointments).where(eq(appointments.id, id));
    if (!apt) return c.json({ error: 'Appointment not found' }, 404);

    // 2. Mark as Completed
    const [completed] = await scoped
      .update(appointments)
      .set({
        status: 'completed',
        updatedAt: new Date(),
      })
      .where(eq(appointments.id, id))
      .returning();

    // 3. Inventory Deduction Logic
    if (apt.procedureId) {
      const [proc] = await db.select().from(procedures).where(eq(procedures.id, apt.procedureId));

      if (proc && proc.bom && Array.isArray(proc.bom)) {
        const bom = proc.bom as any[];

        for (const item of bom) {
          if (item.inventoryId && item.quantity > 0) {
            // Decrement Stock
            await db.execute(sql`
                        UPDATE inventory 
                        SET quantity = quantity - ${item.quantity}, current_stock = current_stock - ${item.quantity}
                        WHERE id = ${item.inventoryId}
                     `);

            // Log Movement
            await scoped.insert(inventoryMovements).values({
              organizationId: auth.organizationId,
              itemId: item.inventoryId,
              type: 'consume',
              quantity: -item.quantity,
              refType: 'appointment',
              refId: String(id),
              createdBy: auth.userId
            });
          }
        }
      }
    }

    return c.json(completed);
  } catch (error: any) {
    console.error('Error completing appointment:', error);
    return c.json({ error: 'Failed to complete appointment' }, 500);
  }
});

// GET /api/appointments/settings - Get appointment settings
app.get('/settings/get', async (c) => {
  const auth = c.get('auth');
  const scoped = scopedDb(c);

  try {
    let [settings] = await db
      .select()
      .from(appointmentSettings)
      .where(eq(appointmentSettings.organizationId, auth.organizationId));

    if (!settings) {
      // Create default settings
      [settings] = await scoped
        .insert(appointmentSettings)
        .values({ organizationId: auth.organizationId })
        .returning();
    }

    return c.json(settings);
  } catch (error: any) {
    console.error('Error getting settings:', error);
    return c.json({ error: 'Failed to get settings' }, 500);
  }
});

// PUT /api/appointments/settings - Update appointment settings
app.put('/settings/update', async (c) => {
  const auth = c.get('auth');
  const scoped = scopedDb(c);
  const body = await c.req.json();

  try {
    const updateData: any = {
      updatedAt: new Date(),
    };

    if (body.allow_patient_booking !== undefined) updateData.allowPatientBooking = body.allow_patient_booking;
    if (body.booking_advance_days) updateData.bookingAdvanceDays = body.booking_advance_days;
    if (body.booking_buffer_hours) updateData.bookingBufferHours = body.booking_buffer_hours;
    if (body.working_hours) updateData.workingHours = body.working_hours;
    if (body.default_slot_duration) updateData.defaultSlotDuration = body.default_slot_duration;
    if (body.slot_interval) updateData.slotInterval = body.slot_interval;
    if (body.max_appointments_per_day) updateData.maxAppointmentsPerDay = body.max_appointments_per_day;
    if (body.whatsapp_enabled !== undefined) updateData.whatsappEnabled = body.whatsapp_enabled;
    if (body.whatsapp_number) updateData.whatsappNumber = body.whatsapp_number;
    if (body.send_confirmation_requests !== undefined) updateData.sendConfirmationRequests = body.send_confirmation_requests;
    if (body.send_reminders !== undefined) updateData.sendReminders = body.send_reminders;
    if (body.reminder_24h_enabled !== undefined) updateData.reminder24hEnabled = body.reminder_24h_enabled;
    if (body.reminder_2h_enabled !== undefined) updateData.reminder2hEnabled = body.reminder_2h_enabled;
    if (body.blocked_dates) updateData.blockedDates = body.blocked_dates;
    if (body.special_hours) updateData.specialHours = body.special_hours;

    const [updated] = await scoped
      .update(appointmentSettings)
      .set(updateData)
      .where(eq(appointmentSettings.organizationId, auth.organizationId))
      .returning();

    if (!updated) {
      return c.json({ error: 'Settings not found' }, 404);
    }

    return c.json(updated);
  } catch (error: any) {
    console.error('Error updating settings:', error);
    return c.json({ error: 'Failed to update settings' }, 500);
  }
});

// GET /api/appointments/availability - Get available slots
app.get('/availability', async (c) => {
  const auth = c.get('auth');
  const scoped = scopedDb(c);
  const { date } = c.req.query();

  if (!date) {
    return c.json({ error: 'Date parameter required' }, 400);
  }

  try {
    // Get settings
    const [settings] = await db
      .select()
      .from(appointmentSettings)
      .where(eq(appointmentSettings.organizationId, auth.organizationId));

    if (!settings) {
      return c.json({ error: 'Settings not configured' }, 404);
    }

    // Get existing appointments for the date
    const existingAppointments = await db
      .select()
      .from(appointments)
      .where(
        and(
          eq(appointments.scheduledDate, date),
          eq(appointments.organizationId, auth.organizationId),
          sql`${appointments.status} != 'cancelled'`
        )
      );

    // Calculate available slots
    const dayOfWeek = new Date(date).toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    const workingHours: any = settings.workingHours || {};
    const dayConfig = workingHours[dayOfWeek];

    if (!dayConfig || !dayConfig.enabled) {
      return c.json({ available: false, reason: 'Dia não disponível', slots: [] });
    }

    // Generate time slots
    const slots = [];
    const slotDuration = settings.slotInterval || 30;
    const startTime = dayConfig.start;
    const endTime = dayConfig.end;
    const breakStart = dayConfig.break_start;
    const breakEnd = dayConfig.break_end;

    let currentTime = startTime;
    while (currentTime < endTime) {
      // Skip break time
      if (breakStart && breakEnd && currentTime >= breakStart && currentTime < breakEnd) {
        currentTime = breakEnd;
        continue;
      }

      // Check if slot is occupied
      const isOccupied = existingAppointments.some(apt =>
        apt.scheduledTime === currentTime
      );

      slots.push({
        time: currentTime,
        available: !isOccupied,
        duration: slotDuration,
      });

      // Increment time
      const [hours, minutes] = currentTime.split(':').map(Number);
      const totalMinutes = hours * 60 + minutes + slotDuration;
      const newHours = Math.floor(totalMinutes / 60);
      const newMinutes = totalMinutes % 60;
      currentTime = `${String(newHours).padStart(2, '0')}:${String(newMinutes).padStart(2, '0')}`;
    }

    return c.json({
      date,
      available: slots.some(s => s.available),
      slots,
      working_hours: dayConfig,
    });
  } catch (error: any) {
    console.error('Error getting availability:', error);
    return c.json({ error: 'Failed to get availability' }, 500);
  }
});

export default app;
