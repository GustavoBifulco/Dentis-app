import { Hono } from 'hono';
import { db } from '../db';
import { cpfCorrectionRequests, patients } from '../db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { authMiddleware } from '../middleware/auth';
import { verifyPatientAccess, generateRequestId } from '../utils/tenant';
import { HTTPException } from 'hono/http-exception';

const app = new Hono<{ Variables: { user: any; auth: any; organizationId: string } }>();

app.use('*', authMiddleware);

// GET /api/cpf-corrections - List requests (Admin/Owner only usually, but for now we'll allow role check in logic)
app.get('/', async (c) => {
    const organizationId = c.get('organizationId');
    const user = c.get('user');

    // Basic role check: Only admin or owner
    if (!['admin', 'owner', 'clinic_owner', 'dentist'].includes(user.role)) {
        throw new HTTPException(403, { message: 'Acesso negado' });
    }

    const requests = await db.query.cpfCorrectionRequests.findMany({
        where: eq(cpfCorrectionRequests.organizationId, organizationId),
        with: { patient: true },
        orderBy: desc(cpfCorrectionRequests.createdAt)
    });

    return c.json(requests);
});

// POST /api/cpf-corrections - Request a correction
app.post('/', async (c) => {
    const organizationId = c.get('organizationId');
    const user = c.get('user');
    const body = await c.req.json();
    const requestId = generateRequestId();

    const { patientId, newCpf, reason } = body;

    if (!patientId || !newCpf || !reason) {
        throw new HTTPException(400, { message: 'Campos obrigatórios: patientId, newCpf, reason' });
    }

    // Anti-IDOR
    await verifyPatientAccess(patientId, organizationId, requestId);

    const [patient] = await db.select().from(patients).where(eq(patients.id, patientId)).limit(1);

    const [request] = await db.insert(cpfCorrectionRequests).values({
        organizationId,
        patientId,
        requestedBy: user.id || user.clerkId || 'unknown',
        oldCpf: patient.cpf,
        newCpf,
        reason,
        status: 'pending'
    }).returning();

    return c.json(request, 201);
});

// POST /api/cpf-corrections/:id/approve
app.post('/:id/approve', async (c) => {
    const organizationId = c.get('organizationId');
    const user = c.get('user');
    const id = parseInt(c.req.param('id'));

    const [request] = await db.select().from(cpfCorrectionRequests)
        .where(and(eq(cpfCorrectionRequests.id, id), eq(cpfCorrectionRequests.organizationId, organizationId)))
        .limit(1);

    if (!request) throw new HTTPException(404, { message: 'Solicitação não encontrada' });
    if (request.status !== 'pending') throw new HTTPException(400, { message: 'Solicitação já processada' });

    // Transaction to update both
    await db.transaction(async (tx) => {
        // 1. Update Patient
        await tx.update(patients)
            .set({ cpf: request.newCpf, updatedAt: new Date() })
            .where(eq(patients.id, request.patientId));

        // 2. Update Request
        await tx.update(cpfCorrectionRequests)
            .set({
                status: 'approved',
                reviewedBy: user.id || user.clerkId || 'unknown',
                reviewedAt: new Date()
            })
            .where(eq(cpfCorrectionRequests.id, id));
    });

    return c.json({ success: true });
});

// POST /api/cpf-corrections/:id/reject
app.post('/:id/reject', async (c) => {
    const organizationId = c.get('organizationId');
    const user = c.get('user');
    const id = parseInt(c.req.param('id'));
    const { reason: rejectionReason } = await c.req.json();

    await db.update(cpfCorrectionRequests)
        .set({
            status: 'rejected',
            reviewedBy: user.id || user.clerkId || 'unknown',
            reviewedAt: new Date(),
            rejectionReason
        })
        .where(and(eq(cpfCorrectionRequests.id, id), eq(cpfCorrectionRequests.organizationId, organizationId)));

    return c.json({ success: true });
});

export default app;
