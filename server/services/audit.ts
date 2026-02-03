import { db } from '../db';
import { auditLogs } from '../db/schema';

type AuditEvent = {
    userId?: number;
    action: string;
    resourceType: string;
    resourceId?: string | number;
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
            userId: event.userId,
            action: event.action,
            resourceType: event.resourceType,
            resourceId: String(event.resourceId || ''),
            tenantId: event.tenantId,
            ip: event.ip || '0.0.0.0',
            reason: event.reason,
            details: event.details ? JSON.stringify(event.details) : null,
            timestamp: new Date()
        });
    } catch (error) {
        // Audit logging failure should not crash the app, but must be reported
        console.error('CRITICAL: Failed to write audit log', error);
    }
};
