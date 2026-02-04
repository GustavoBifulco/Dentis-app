import { db } from '../db';
import { timelineEvents } from '../db/schema';

type TimelineEventInput = {
    organizationId: string;
    unitId?: string;
    patientId?: number;
    eventType: 'clinical' | 'financial' | 'logistic' | 'system' | 'lab';
    refType: 'encounter' | 'payment' | 'shipment' | 'lab_case' | 'document' | 'alert';
    refId: string;
    title: string;
    summary?: string;
    metadata?: any;
    createdBy?: string;
};

/**
 * Logs a business event to the unified timeline.
 * This is the central nervous system of Odonto OS.
 */
export const logTimelineEvent = async (event: TimelineEventInput) => {
    try {
        await db.insert(timelineEvents).values({
            organizationId: event.organizationId,
            unitId: event.unitId,
            patientId: event.patientId,
            eventType: event.eventType,
            refType: event.refType,
            refId: event.refId,
            title: event.title,
            summary: event.summary,
            metadata: event.metadata,
            createdBy: event.createdBy,
            createdAt: new Date(),
        });
    } catch (error) {
        // Timeline logging failure is critical for visibility but shouldn't block the transaction if possible.
        // In a perfect world, this is part of the same transaction as the action.
        console.error('CRITICAL: Failed to write timeline event', error);
    }
};
