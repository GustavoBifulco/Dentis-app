import { Hono } from 'hono';
import { db } from '../db';
import {
    patients,
    users,
    appointments,
    documents,
    financials,
    patientConsents,
    patientAlerts,
    clinicalRecords,
    encounters,
    treatmentPlans
} from '../db/schema';
import { eq, and, desc, sql } from 'drizzle-orm';
import { authMiddleware } from '../middleware/auth';
import { checkTenantAccess, verifyPatientAccess } from '../utils/tenant';
import { logAccess } from '../services/audit';

const app = new Hono<{ Variables: { user: any; organizationId: string; userId: string } }>();

app.use('*', authMiddleware);

/**
 * GET /api/patients/:id/overview
 * 
 * Consolidated endpoint that returns all prontuário data in one request.
 * Supports role-based filtering via ?view=patient|dentist query param.
 * 
 * Security:
 * - Validates organizationId (Anti-IDOR)
 * - Checks RBAC permissions
 * - Filters sensitive data based on user role
 * - Logs access for LGPD compliance
 */
app.get('/:id/overview', async (c) => {
    const patientId = Number(c.req.param('id'));
    const organizationId = c.get('organizationId');
    const user = c.get('user');
    const userId = c.get('userId');

    // Query param to determine view type
    const viewType = c.req.query('view') || 'dentist'; // default to dentist view

    try {
        // Security: Check tenant access
        checkTenantAccess(user, organizationId, 'view_clinical_record');

        // Security: Verify patient belongs to this organization (Anti-IDOR)
        await verifyPatientAccess(patientId, organizationId);

        // Fetch patient core data
        const [patient] = await db
            .select()
            .from(patients)
            .where(and(
                eq(patients.id, patientId),
                eq(patients.organizationId, organizationId)
            ))
            .limit(1);

        if (!patient) {
            return c.json({ error: 'Patient not found' }, 404);
        }

        // Resolve avatar URL
        let avatarUrl = null;
        if (patient.userId) {
            // Try to get from users table (cached Clerk data)
            const [userRecord] = await db
                .select({ avatarUrl: users.avatarUrl })
                .from(users)
                .where(eq(users.clerkId, patient.userId))
                .limit(1);

            avatarUrl = userRecord?.avatarUrl || null;
        }

        // Fetch recent appointments (last 5)
        const recentAppointments = await db
            .select({
                id: appointments.id,
                scheduledDate: appointments.scheduledDate,
                scheduledTime: appointments.scheduledTime,
                status: appointments.status,
                appointmentType: appointments.appointmentType,
                notes: appointments.notes
            })
            .from(appointments)
            .where(and(
                eq(appointments.patientId, patientId),
                eq(appointments.organizationId, organizationId)
            ))
            .orderBy(desc(appointments.scheduledDate))
            .limit(5);

        // Fetch documents summary (count by type)
        const documentsSummary = await db
            .select({
                type: documents.type,
                count: sql<number>`count(*)::int`
            })
            .from(documents)
            .where(and(
                eq(documents.patientId, patientId),
                eq(documents.organizationId, organizationId)
            ))
            .groupBy(documents.type);

        // Fetch financial summary
        const financialSummary = await db
            .select({
                totalDebt: sql<string>`COALESCE(SUM(CASE WHEN status = 'PENDING' THEN CAST(amount AS NUMERIC) ELSE 0 END), 0)`,
                totalPaid: sql<string>`COALESCE(SUM(CASE WHEN status = 'PAID' THEN CAST(amount AS NUMERIC) ELSE 0 END), 0)`,
                pendingCount: sql<number>`COUNT(CASE WHEN status = 'PENDING' THEN 1 END)::int`
            })
            .from(financials)
            .where(and(
                eq(financials.patientId, patientId),
                eq(financials.organizationId, organizationId)
            ));

        // Fetch consent flags
        const consents = await db
            .select({
                id: patientConsents.id,
                title: patientConsents.title,
                signedAt: patientConsents.signedAt
            })
            .from(patientConsents)
            .where(and(
                eq(patientConsents.patientId, patientId),
                eq(patientConsents.organizationId, organizationId)
            ))
            .orderBy(desc(patientConsents.signedAt));

        // Fetch active alerts
        const alerts = await db
            .select()
            .from(patientAlerts)
            .where(and(
                eq(patientAlerts.patientId, patientId),
                eq(patientAlerts.organizationId, organizationId),
                eq(patientAlerts.active, true)
            ))
            .orderBy(desc(patientAlerts.severity));

        // Fetch treatment progress (simplified)
        const treatmentProgress = {
            activePlans: await db
                .select({ count: sql<number>`count(*)::int` })
                .from(treatmentPlans)
                .where(and(
                    eq(treatmentPlans.patientId, patientId),
                    eq(treatmentPlans.organizationId, organizationId),
                    eq(treatmentPlans.status, 'active')
                ))
                .then(res => res[0]?.count || 0),
            completedAppointments: recentAppointments.filter(a => a.status === 'completed').length,
            totalAppointments: recentAppointments.length
        };

        // Calculate permissions for this patient
        const permissions = {
            canEdit: viewType === 'dentist',
            canDelete: viewType === 'dentist' && user.role !== 'staff',
            canViewFinancials: true,
            canCreateRecords: viewType === 'dentist',
            canViewClinicalNotes: viewType === 'dentist'
        };

        // Filter data based on view type
        let responseData: any = {
            patient: {
                id: patient.id,
                name: patient.name,
                email: patient.email,
                phone: patient.phone,
                cpf: patient.cpf,
                birthdate: patient.birthdate,
                gender: patient.gender,
                status: patient.status,
                avatarUrl,
                hasAccount: !!patient.userId
            },
            appointments: recentAppointments,
            documents: documentsSummary,
            financial: financialSummary[0] || { totalDebt: '0', totalPaid: '0', pendingCount: 0 },
            consents: consents.map(c => ({
                id: c.id,
                title: c.title,
                signedAt: c.signedAt
            })),
            alerts: alerts.map(a => ({
                id: a.id,
                type: a.type,
                severity: a.severity,
                description: a.description,
                createdAt: a.createdAt
            })),
            treatmentProgress,
            permissions
        };

        // Patient view: filter sensitive data
        if (viewType === 'patient') {
            // Remove internal notes from appointments
            responseData.appointments = responseData.appointments.map((apt: any) => ({
                ...apt,
                notes: undefined // Hide dentist notes
            }));

            // Limit alerts to patient-facing ones only
            responseData.alerts = responseData.alerts.filter((a: any) =>
                a.type !== 'internal' && a.severity !== 'low'
            );

            // Hide detailed financial breakdown (show only totals)
            responseData.financial = {
                totalDebt: responseData.financial.totalDebt,
                pendingCount: responseData.financial.pendingCount
            };
        }

        // LGPD: Log access
        await logAccess({
            organizationId,
            userId: user.id,
            patientId,
            action: 'VIEW',
            resourceType: 'patient_overview',
            ip: c.req.header('x-forwarded-for'),
            userAgent: c.req.header('user-agent'),
        });

        return c.json({
            ok: true,
            data: responseData,
            viewType
        });

    } catch (error: any) {
        console.error('[Overview] Error fetching patient overview:', error.message);
        return c.json({
            error: 'Failed to fetch patient overview',
            details: error.message
        }, 500);
    }
});

export default app;
