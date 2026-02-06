import { db } from '../db';
import { auditLogs, accessLogs } from '../db/schema';

type AuditEvent = {
    userId?: number;
    action: string;
    resourceType: string;
    resourceId?: string | number;
    resource?: string; // Optional explicit resource name
    tenantId?: string;
    ip?: string;
    reason?: string;
    details?: any;
};

/**
 * Logs a sensitive action to the audit trail.
 * This should be used for all access to clinical data, financials data, and PII exports.
 */
export const logAudit = async (event: AuditEvent) => {
    try {
        await db.insert(auditLogs).values({
            userId: String(event.userId || 'system'),
            action: event.action,
            organizationId: event.tenantId, // Map tenantId to organizationId column
            resource: event.resource || (event.resourceId ? `${event.resourceType}/${event.resourceId}` : event.resourceType),
            ipAddress: event.ip || '0.0.0.0', // Corrected column name from ip to ipAddress
            details: JSON.stringify({ ...(event.details || {}), reason: event.reason }),
            createdAt: new Date()
        });
    } catch (error) {
        console.error('CRITICAL: Failed to write audit log', error);
    }
};

type AccessEvent = {
    organizationId: string;
    userId: string;
    patientId?: number;
    action: 'VIEW' | 'DOWNLOAD' | 'SEARCH';
    resourceType: string;
    resourceId?: string;
    ip?: string;
    userAgent?: string;
};

/**
 * Logs read access to detailed records (Privacy/LGPD).
 * Must be called whenever a sensitive record is opened.
 */
export const logAccess = async (event: AccessEvent) => {
    try {
        await db.insert(accessLogs).values({
            organizationId: event.organizationId,
            userId: event.userId,
            patientId: event.patientId,
            action: event.action,
            resourceType: event.resourceType,
            resourceId: event.resourceId,
            ip: event.ip || '0.0.0.0',
            userAgent: event.userAgent,
            createdAt: new Date()
        });
    } catch (error) {
        console.error('CRITICAL: Failed to write access log', error);
    }
};

