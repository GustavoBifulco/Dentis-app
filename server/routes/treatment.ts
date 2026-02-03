
import { Hono } from 'hono';
import { db } from '../db';
import { appointments, procedures, patients } from '../db/schema';
import { eq, and, desc, asc } from 'drizzle-orm';
import { authMiddleware } from '../middleware/auth';

const app = new Hono();

app.use('*', authMiddleware);

// GET /api/treatment/progress/:patientId
app.get('/progress/:patientId', async (c) => {
    const patientId = parseInt(c.req.param('patientId'));
    const auth = c.get('auth');

    // Fetch appointments for this patient
    const patientAppointments = await db.select({
        date: appointments.scheduledDate,
        status: appointments.status,
        type: appointments.appointmentType,
        procedureName: procedures.name
    })
        .from(appointments)
        .leftJoin(procedures, eq(appointments.procedureId, procedures.id))
        .where(and(
            eq(appointments.patientId, patientId),
            eq(appointments.organizationId, auth.organizationId)
        ))
        .orderBy(asc(appointments.scheduledDate));

    // Define standard Journey Phases
    // This logic synthesizes progress based on appointment history
    const phases = [
        {
            id: 'phase-1',
            title: 'Consulta Inicial',
            status: 'pending', // pending, current, completed
            type: 'consulta'
        },
        {
            id: 'phase-2',
            title: 'Escaneamento 3D',
            status: 'pending',
            type: 'exame'
        },
        {
            id: 'phase-3',
            title: 'Planejamento Digital',
            status: 'pending',
            type: 'planejamento'
        },
        {
            id: 'phase-4',
            title: 'Instalação',
            status: 'pending',
            type: 'instalacao'
        },
        {
            id: 'phase-5',
            title: 'Acompanhamento',
            status: 'pending',
            type: 'manutencao'
        }
    ];

    // Determine status of each phase based on history
    let lastCompletedIndex = -1;

    // Check Phase 1: Consulta
    if (patientAppointments.some(a => a.type === 'consulta' && (a.status === 'completed' || a.status === 'confirmed'))) {
        phases[0].status = 'completed';
        lastCompletedIndex = 0;
    }

    // Check Phase 2: Escaneamento (Look for procedure name or notes)
    if (patientAppointments.some(a => a.procedureName?.toLowerCase().includes('scan') || a.procedureName?.toLowerCase().includes('escaneamento'))) {
        phases[1].status = 'completed';
        lastCompletedIndex = 1;
    } else if (lastCompletedIndex === 0) {
        phases[1].status = 'current';
    }

    // Check Phase 3... Logic can be expanded.
    // For MVP, if we have > 2 appointments, assume planning is done
    if (patientAppointments.length > 2 && lastCompletedIndex >= 1) {
        phases[2].status = 'completed';
        lastCompletedIndex = 2;
    } else if (lastCompletedIndex === 1) {
        phases[2].status = 'current';
    }

    // Default: if no appointments, Phase 1 is current
    if (lastCompletedIndex === -1 && phases[0].status === 'pending') {
        phases[0].status = 'current';
    }

    // Calculate overall progress
    // If lastCompleted is 2, progress is (2+1)/5 * 100?
    // Or strictly count completed phases
    const completedCount = phases.filter(p => p.status === 'completed').length;
    const progress = Math.round((completedCount / phases.length) * 100);

    return c.json({
        phases,
        progress
    });
});

export default app;
