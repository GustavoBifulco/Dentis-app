import { Hono } from 'hono';
import { authMiddleware } from '../middleware/auth';
import { db } from '../db';
import { appointments, financial, users, patients, clinicMembers, procedures } from '../db/schema';
import { eq, and, gte, lte, sql } from 'drizzle-orm';

import { clerkClient } from '@clerk/clerk-sdk-node';

const dashboard = new Hono<{ Variables: { userId: string, clerkId: string } }>();

dashboard.use('*', authMiddleware);

dashboard.get('/stats', async (c) => {
    const userId = Number(c.get('userId'));
    const clerkId = c.get('clerkId');

    // 1. User Info
    const [user] = await db.select().from(users).where(eq(users.id, userId));

    // Fallback Name from Clerk if DB is empty (common in first sync)
    let displayName = user?.name;
    if (!displayName) {
        try {
            const clerkUser = await clerkClient.users.getUser(clerkId);
            displayName = clerkUser.firstName || clerkUser.fullName || '';
        } catch (e) {
            console.error('Clerk User Fetch Error in Dashboard', e);
        }
    }

    // 2. Appointments Today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    // Appointments Count Query
    const [appCount] = await db.select({ count: sql<number>`count(*)` })
        .from(appointments)
        .where(
            and(
                eq(appointments.dentistId, userId),
                gte(appointments.startTime, today),
                lte(appointments.startTime, tomorrow)
            )
        );

    // Revenue Query (Current Month)
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    const [rev] = await db.select({ total: sql<number>`sum(${financial.amount})` })
        .from(financial)
        .where(
            and(
                eq(financial.userId, userId), // Linked to dentist
                eq(financial.type, 'income'), // Lowercase to match
                gte(financial.dueDate, startOfMonth),
                lte(financial.dueDate, endOfMonth)
            )
        );

    // Next Appointment (Join with Patients)
    const [nextApp] = await db.select({
        startTime: appointments.startTime,
        patientName: patients.name
    })
        .from(appointments)
        .innerJoin(patients, eq(appointments.patientId, patients.id))
        .where(
            and(
                eq(appointments.dentistId, userId),
                gte(appointments.startTime, new Date())
            )
        )
        .orderBy(appointments.startTime)
        .limit(1);

    // 4. Data Validity Check (Self-Healing Trigger)
    let needsSetup = false;
    const [membership] = await db.select().from(clinicMembers).where(eq(clinicMembers.userId, userId));

    if (!membership) {
        needsSetup = true;
    } else {
        const [procCount] = await db.select({ count: sql<number>`count(*)` })
            .from(procedures)
            .where(eq(procedures.clinicId, membership.clinicId));

        if (Number(procCount?.count || 0) === 0) {
            needsSetup = true;
        }
    }

    return c.json({
        userName: displayName || 'Doutor',
        appointmentsToday: Number(appCount?.count || 0),
        revenueMonth: Number(rev?.total || 0),
        nextPatient: nextApp ? nextApp.patientName : null,
        nextTime: nextApp ? new Date(nextApp.startTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : null,
        needsSetup
    });
});

export default dashboard;
