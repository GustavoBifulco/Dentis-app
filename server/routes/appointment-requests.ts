import { Hono } from 'hono';
import { appointmentRequests, appointments, patients } from '../db/schema';
import { scopedDb } from '../db/scoped';
import { authMiddleware } from '../middleware/auth';
import { eq, and, desc } from 'drizzle-orm';

const app = new Hono();

app.use('*', authMiddleware);

// GET /api/appointment-requests - List appointment requests
app.get('/', async (c) => {
    const auth = c.get('auth');
    const scoped = scopedDb(c);

    const { status } = c.req.query();

    let conditions = [];
    if (status) {
        conditions.push(eq(appointmentRequests.status, status));
    }

    const list = await scoped
        .select({
            request: appointmentRequests,
            patient: patients,
        })
        .from(appointmentRequests)
        .leftJoin(patients, eq(appointmentRequests.patientId, patients.id))
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(desc(appointmentRequests.createdAt));

    return c.json(list.map(row => ({
        ...row.request,
        patient: row.patient,
    })));
});

// GET /api/appointment-requests/:id - Get single request
app.get('/:id', async (c) => {
    const id = parseInt(c.req.param('id'));
    const scoped = scopedDb(c);

    const [result] = await scoped
        .select({
            request: appointmentRequests,
            patient: patients,
        })
        .from(appointmentRequests)
        .leftJoin(patients, eq(appointmentRequests.patientId, patients.id))
        .where(eq(appointmentRequests.id, id));

    if (!result) {
        return c.json({ error: 'Request not found' }, 404);
    }

    return c.json({
        ...result.request,
        patient: result.patient,
    });
});

// POST /api/appointment-requests - Create appointment request (patient)
app.post('/', async (c) => {
    const auth = c.get('auth');
    const scoped = scopedDb(c);
    const body = await c.req.json();

    try {
        const [newRequest] = await scoped.insert(appointmentRequests).values({
            organizationId: auth.organizationId,
            patientId: body.patient_id,
            requestedDate: body.requested_date,
            requestedTime: body.requested_time,
            preferredDuration: body.preferred_duration || 60,
            reason: body.reason,
            urgency: body.urgency || 'normal',
        }).returning();

        return c.json(newRequest, 201);
    } catch (error: any) {
        console.error('Error creating request:', error);
        return c.json({ error: 'Failed to create request' }, 500);
    }
});

// POST /api/appointment-requests/:id/approve - Approve request
app.post('/:id/approve', async (c) => {
    const id = parseInt(c.req.param('id'));
    const auth = c.get('auth');
    const scoped = scopedDb(c);
    const body = await c.req.json();

    try {
        // Get the request
        const [request] = await scoped
            .select()
            .from(appointmentRequests)
            .where(eq(appointmentRequests.id, id));

        if (!request) {
            return c.json({ error: 'Request not found' }, 404);
        }

        if (request.status !== 'pending') {
            return c.json({ error: 'Request already processed' }, 400);
        }

        // Create appointment
        const [newAppointment] = await scoped.insert(appointments).values({
            organizationId: auth.organizationId,
            patientId: request.patientId,
            dentistId: auth.userId,
            scheduledDate: request.requestedDate,
            scheduledTime: request.requestedTime,
            duration: body.duration || request.preferredDuration,
            appointmentType: 'consulta',
            notes: body.notes || `Solicitado pelo paciente: ${request.reason}`,
            chiefComplaint: request.reason,
            notifyPatient: body.notify_patient !== false,
            confirmationRequired: body.confirmation_required !== false,
        }).returning();

        // Update request status
        await scoped
            .update(appointmentRequests)
            .set({
                status: 'approved',
                reviewedBy: auth.userId,
                reviewedAt: new Date(),
                appointmentId: newAppointment.id,
            })
            .where(eq(appointmentRequests.id, id));

        return c.json({
            success: true,
            appointment: newAppointment,
            request: { ...request, status: 'approved' },
        });
    } catch (error: any) {
        console.error('Error approving request:', error);
        return c.json({ error: 'Failed to approve request' }, 500);
    }
});

// POST /api/appointment-requests/:id/reject - Reject request
app.post('/:id/reject', async (c) => {
    const id = parseInt(c.req.param('id'));
    const auth = c.get('auth');
    const scoped = scopedDb(c);
    const body = await c.req.json();

    try {
        const [rejected] = await scoped
            .update(appointmentRequests)
            .set({
                status: 'rejected',
                reviewedBy: auth.userId,
                reviewedAt: new Date(),
                rejectionReason: body.rejection_reason || 'Horário indisponível',
            })
            .where(eq(appointmentRequests.id, id))
            .returning();

        if (!rejected) {
            return c.json({ error: 'Request not found' }, 404);
        }

        return c.json({ success: true, request: rejected });
    } catch (error: any) {
        console.error('Error rejecting request:', error);
        return c.json({ error: 'Failed to reject request' }, 500);
    }
});

export default app;
