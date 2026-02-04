/**
 * P6. Jobs & Queue Foundation
 * Abstraction for asynchronous tasks.
 * Currently In-Memory, design allows hot-swap to Redis/BullMQ.
 */

export interface JobData {
    type: string;
    payload: any;
    traceId?: string;
}

export type JobProcessor = (job: JobData) => Promise<void>;

class SimpleJobQueue {
    private processors: Map<string, JobProcessor> = new Map();

    constructor() {
        console.log('[JobQueue] Initialized (In-Memory Driver)');
    }

    /**
     * Register a worker for a job type.
     */
    process(type: string, handler: JobProcessor) {
        this.processors.set(type, handler);
        console.log(`[JobQueue] Worker registered for: ${type}`);
    }

    /**
     * Add a job to the queue.
     * Guaranteed to return fast.
     */
    async add(type: string, payload: any, options?: { traceId?: string }) {
        // In-Memory implementation executes immediately but async (next tick)
        // In Redis, this would push to list.
        const processor = this.processors.get(type);

        if (!processor) {
            console.warn(`[JobQueue] No processor for job type: ${type}`);
            return;
        }

        const job: JobData = { type, payload, traceId: options?.traceId };

        // Fire and forget (Mocking queue behavior)
        Promise.resolve().then(async () => {
            try {
                // console.log(`[JobQueue] Processing ${type}`, job.traceId);
                await processor(job);
                // console.log(`[JobQueue] Completed ${type}`, job.traceId);
            } catch (err) {
                console.error(`[JobQueue] Failed ${type}`, err);
                // Retry logic would go here
            }
        });
    }
}

export const jobQueue = new SimpleJobQueue();
