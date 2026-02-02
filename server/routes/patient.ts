import { Hono } from 'hono';
import { db } from '../db';
import { financial, patients, documents, appointments, clinicalRecords } from '../db/schema';
import { eq, and, desc, inArray } from 'drizzle-orm';
import { authMiddleware } from '../middleware/auth';

const patient = new Hono<{ Variables: { userId: number } }>();

patient.use('*', authMiddleware);

/**
 * GET /api/patient/financials
 * Returns all financial records for the patient contexts associated with the current user
 */
patient.get('/financials', async (c) => {
    const userId = c.get('userId');

    // Find all patient records associated with this userId
    const userPatients = await db
        .select()
        .from(patients)
        .where(eq(patients.userId, userId));

    if (userPatients.length === 0) {
        return c.json({ financials: [] });
    }

    const patientIds = userPatients.map(p => p.id);

    // Fetch all financial records for these patients
    const records = await db
        .select({
            id: financial.id,
            type: financial.type,
            amount: financial.amount,
            description: financial.description,
            dueDate: financial.dueDate,
            paidAt: financial.paidAt,
            status: financial.status,
            category: financial.category,
            createdAt: financial.createdAt
        })
        .from(financial)
        .where(and(
            inArray(financial.patientId, patientIds),
            eq(financial.organizationId, userPatients[0].organizationId) // Extra safety check
        ))
        .orderBy(desc(financial.createdAt));

    return c.json({ ok: true, financials: records });
});

/**
 * GET /api/patient/scans
 * Returns all 3D scans (documents of type SCAN) for the patient
 */
patient.get('/scans', async (c) => {
    const userId = c.get('userId');

    const userPatients = await db
        .select()
        .from(patients)
        .where(eq(patients.userId, userId));

    if (userPatients.length === 0) {
        return c.json({ scans: [] });
    }

    const scans = await db
        .select()
        .from(documents)
        .where(and(
            eq(documents.patientId, userPatients[0].id),
            eq(documents.type, 'LAB_SCAN')
        ));

    return c.json({ scans });
});

export default patient;
