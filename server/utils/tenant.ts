
import { HTTPException } from 'hono/http-exception';
import { db } from '../db';
import { patients, documents, appointments, financials } from '../db/schema';
import { eq, and } from 'drizzle-orm';
import { randomUUID } from 'crypto';

// Utility to generate request ID for consistent logging
export const generateRequestId = () => randomUUID().slice(0, 8);

/**
 * Enforces strict tenant (organization) isolation.
 * Throws 403 Forbidden if the user's active organization does not match the resource's organization.
 * 
 * @param user The authenticated user context object (must contain organizationId/organizationId)
 * @param resourceTenantId The organization ID associated with the resource being accessed
 * @param action Optional action name for logging
 */
export const checkTenantAccess = (user: any, resourceTenantId: number | string, action: string = 'access') => {
    if (!user) {
        throw new HTTPException(401, { message: 'User not authenticated' });
    }

    // Normalize IDs to strings for comparison to avoid string/number mismatches
    const userOrgId = String(user.organizationId || user.organizationId);
    const resourceOrgId = String(resourceTenantId);

    if (!userOrgId || userOrgId === 'undefined') {
        console.error(`Security Alert: User ${user.id} has no active organization context during ${action}.`);
        throw new HTTPException(403, { message: 'No active organization context' });
    }

    if (userOrgId !== resourceOrgId) {
        console.error(`SECURITY VIOLATION: User ${user.id} (Org: ${userOrgId}) attempted to ${action} resource in Org ${resourceOrgId}`);
        throw new HTTPException(403, { message: 'Access denied: Resource belongs to another organization' });
    }
};

/**
 * Validates if the patient belongs to the current user's organization.
 * Used to prevent IDOR in creation routes.
 */
export const verifyPatientAccess = async (patientId: number, organizationId: string, requestId?: string) => {
    const rid = requestId || generateRequestId();
    const patient = await db.query.patients.findFirst({
        where: eq(patients.id, patientId),
        columns: { organizationId: true }
    });

    if (!patient) {
        console.warn(`[IDOR:${rid}] Patient ${patientId} not found`);
        throw new HTTPException(404, { message: 'Patient not found' });
    }

    if (patient.organizationId !== organizationId) {
        console.error(`[IDOR:${rid}] SECURITY VIOLATION: Patient ${patientId} belongs to org ${patient.organizationId}, not ${organizationId}`);
        throw new HTTPException(403, { message: 'Access denied: Patient belongs to another organization' });
    }

    return true;
};

/**
 * Validates if a document belongs to the current user's organization.
 * Used to prevent IDOR in document access routes.
 */
export const verifyDocumentAccess = async (documentId: number, organizationId: string, requestId?: string) => {
    const rid = requestId || generateRequestId();
    const document = await db.query.documents.findFirst({
        where: eq(documents.id, documentId),
        columns: { organizationId: true }
    });

    if (!document) {
        console.warn(`[IDOR:${rid}] Document ${documentId} not found`);
        throw new HTTPException(404, { message: 'Document not found' });
    }

    if (document.organizationId !== organizationId) {
        console.error(`[IDOR:${rid}] SECURITY VIOLATION: Document ${documentId} belongs to org ${document.organizationId}, not ${organizationId}`);
        throw new HTTPException(403, { message: 'Access denied: Document belongs to another organization' });
    }

    return true;
};

/**
 * Validates if an appointment belongs to the current user's organization.
 * Used to prevent IDOR in appointment access routes.
 */
export const verifyAppointmentAccess = async (appointmentId: number, organizationId: string, requestId?: string) => {
    const rid = requestId || generateRequestId();
    const appointment = await db.query.appointments.findFirst({
        where: eq(appointments.id, appointmentId),
        columns: { organizationId: true }
    });

    if (!appointment) {
        console.warn(`[IDOR:${rid}] Appointment ${appointmentId} not found`);
        throw new HTTPException(404, { message: 'Appointment not found' });
    }

    if (appointment.organizationId !== organizationId) {
        console.error(`[IDOR:${rid}] SECURITY VIOLATION: Appointment ${appointmentId} belongs to org ${appointment.organizationId}, not ${organizationId}`);
        throw new HTTPException(403, { message: 'Access denied: Appointment belongs to another organization' });
    }

    return true;
};

/**
 * Validates if a financial record belongs to the current user's organization.
 * Used to prevent IDOR in financial access routes.
 */
export const verifyFinancialAccess = async (financialId: number, organizationId: string, requestId?: string) => {
    const rid = requestId || generateRequestId();
    const financial = await db.query.financials.findFirst({
        where: eq(financials.id, financialId),
        columns: { organizationId: true }
    });

    if (!financial) {
        console.warn(`[IDOR:${rid}] Financial record ${financialId} not found`);
        throw new HTTPException(404, { message: 'Financial record not found' });
    }

    if (financial.organizationId !== organizationId) {
        console.error(`[IDOR:${rid}] SECURITY VIOLATION: Financial ${financialId} belongs to org ${financial.organizationId}, not ${organizationId}`);
        throw new HTTPException(403, { message: 'Access denied: Financial record belongs to another organization' });
    }

    return true;
};
