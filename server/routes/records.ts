import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { db } from '../db';
import {
    encounters,
    prescriptions,
    examOrders,
    documentsEmitted,
    documents,
    patientAlerts,
    patientConsents,
    patientProblems,
    patientMedications,
    odontogram, treatmentPlans, planItems, timelineEvents
} from '../db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { authMiddleware, requireMfa } from '../middleware/auth';
import { checkTenantAccess, verifyPatientAccess } from '../utils/tenant';
import { logAudit, logAccess } from '../services/audit';
import { getLockReason } from '../utils/status';
import { logTimelineEvent } from '../services/timeline';

const app = new Hono<{ Variables: { user: any; organizationId: string; userId: string } }>();

app.use('*', authMiddleware);

// --- Validations ---
const encounterSchema = z.object({
    patientId: z.number(),
    type: z.enum(['consulta', 'retorno', 'urgencia', 'cirurgia']),
    subjective: z.string().optional(),
    objective: z.string().optional(),
    assessment: z.string().optional(),
    plan: z.string().optional(),
    appointmentId: z.number().optional(),
});

const alertSchema = z.object({
    patientId: z.number(),
    description: z.string().min(1, 'Descrição obrigatória').trim(),
    type: z.string().optional(),
    severity: z.enum(['low', 'medium', 'high', 'critical']).optional(),
});

const problemSchema = z.object({
    patientId: z.number(),
    name: z.string().min(1, 'Nome obrigatório').trim(),
    code: z.string().optional(),
    status: z.string().optional(),
    diagnosedAt: z.string().optional(),
});

const medicationSchema = z.object({
    patientId: z.number(),
    name: z.string().min(1, 'Nome obrigatório').trim(),
    dosage: z.string().optional(),
    frequency: z.string().optional(),
    startDate: z.string().optional(),
});

const consentSchema = z.object({
    patientId: z.number(),
    title: z.string().min(1, 'Título obrigatório').trim(),
    content: z.string().min(1, 'Conteúdo obrigatório'),
});

const odontogramSchema = z.object({
    patientId: z.number(),
    tooth: z.number(),
    surface: z.string().optional(),
    condition: z.string().min(1),
    material: z.string().optional(),
    notes: z.string().optional(),
});

const planSchema = z.object({
    patientId: z.number(),
    title: z.string().min(1, 'Título obrigatório').trim(),
    totalCost: z.number().optional(),
    items: z.array(z.object({
        name: z.string(),
        price: z.number(),
        procedureId: z.number().optional(),
        tooth: z.number().optional(),
        surface: z.string().optional(),
    })).optional(),
});

// GET /api/records/timeline/:patientId
app.get('/timeline/:patientId', async (c) => {
    const patientId = Number(c.req.param('patientId'));
    const organizationId = c.get('organizationId');
    const user = c.get('user');

    checkTenantAccess(user, organizationId, 'view_clinical_record');

    // Fetch new Unified Timeline Events
    const newEvents = await db.select().from(timelineEvents)
        .where(and(eq(timelineEvents.patientId, patientId), eq(timelineEvents.organizationId, organizationId)));

    // Fetch all legacy clinical events in parallel
    const [
        encountersList,
        prescriptionsList,
        examsList,
        documentsList,
        attachmentsList
    ] = await Promise.all([
        db.select().from(encounters).where(and(eq(encounters.patientId, patientId), eq(encounters.organizationId, organizationId))),
        db.select().from(prescriptions).where(and(eq(prescriptions.patientId, patientId), eq(prescriptions.organizationId, organizationId))),
        db.select().from(examOrders).where(and(eq(examOrders.patientId, patientId), eq(examOrders.organizationId, organizationId))),
        db.select().from(documentsEmitted).where(and(eq(documentsEmitted.patientId, patientId), eq(documentsEmitted.organizationId, organizationId))),
        db.select().from(documents).where(and(eq(documents.patientId, patientId), eq(documents.organizationId, organizationId))) // Legacy/Generic attachments
    ]);

    // Normalize and Merge
    const timeline = [
        ...newEvents.map(e => ({
            type: 'timeline_event', // Frontend helper to handle generic events
            date: e.createdAt,
            data: e
        })),
        ...encountersList.map(e => ({ type: 'encounter', date: e.date, data: e })),
        ...prescriptionsList.map(p => ({ type: 'prescription', date: p.issuedAt || p.createdAt, data: p })),
        ...examsList.map(x => ({ type: 'exam_order', date: x.createdAt, data: x })),
        ...documentsList.map(d => ({ type: 'document_emitted', date: d.createdAt, data: d })),
        ...attachmentsList.map(a => ({ type: 'attachment', date: a.createdAt, data: a }))
    ].sort((a, b) => {
        const dateA = new Date(a.date as any).getTime();
        const dateB = new Date(b.date as any).getTime();
        return dateB - dateA; // Descending
    });

    logAudit({
        userId: user.id,
        action: 'VIEW_TIMELINE',
        resourceType: 'patient',
        resourceId: patientId,
        tenantId: organizationId,
        ip: c.req.header('x-forwarded-for') || 'unknown',
        details: { patientId }
    });

    return c.json({ ok: true, timeline });
});

// --- ALERTS ---
app.get('/alerts/:patientId', async (c) => {
    const patientId = Number(c.req.param('patientId'));
    const organizationId = c.get('organizationId');

    // Explicitly select fields to avoid type issues if table def differs slightly
    const alerts = await db.select().from(patientAlerts)
        .where(and(
            eq(patientAlerts.patientId, patientId),
            eq(patientAlerts.organizationId, organizationId),
            eq(patientAlerts.active, true)
        ))
        .orderBy(desc(patientAlerts.severity));

    return c.json(alerts);
});

app.post('/alerts', zValidator('json', alertSchema), async (c) => {
    const body = c.req.valid('json');
    const organizationId = c.get('organizationId');
    const user = c.get('user');

    // Anti-IDOR
    await verifyPatientAccess(body.patientId, organizationId);

    const [alert] = await db.insert(patientAlerts).values({
        organizationId,
        patientId: body.patientId,
        type: body.type || 'observation',
        severity: body.severity || 'low',
        description: body.description,
        createdBy: user.id,
        active: true
    }).returning();

    logAudit({
        userId: user.id,
        action: 'CREATE_ALERT',
        resourceType: 'clinical_alert',
        resourceId: alert.id,
        tenantId: organizationId,
        ip: c.req.header('x-forwarded-for') || 'unknown',
        details: { patientId: body.patientId, type: body.type }
    });

    return c.json(alert);
});

// --- PROBLEMS (Problem List) ---
app.get('/problems/:patientId', async (c) => {
    const patientId = Number(c.req.param('patientId'));
    const organizationId = c.get('organizationId');

    const problems = await db.select().from(patientProblems)
        .where(and(eq(patientProblems.patientId, patientId), eq(patientProblems.organizationId, organizationId)));

    return c.json(problems);
});

app.post('/problems', zValidator('json', problemSchema), async (c) => {
    const body = c.req.valid('json');
    const organizationId = c.get('organizationId');

    // Anti-IDOR
    await verifyPatientAccess(body.patientId, organizationId);

    const [problem] = await db.insert(patientProblems).values({
        organizationId,
        patientId: body.patientId,
        name: body.name,
        code: body.code,
        status: body.status || 'active',
        diagnosedAt: body.diagnosedAt ? new Date(body.diagnosedAt).toISOString() : undefined
    }).returning();

    return c.json(problem);
});

// --- MEDICATIONS (Continuous) ---
app.get('/medications/:patientId', async (c) => {
    const patientId = Number(c.req.param('patientId'));
    const organizationId = c.get('organizationId');

    const meds = await db.select().from(patientMedications)
        .where(and(eq(patientMedications.patientId, patientId), eq(patientMedications.organizationId, organizationId)));

    return c.json(meds);
});

app.post('/medications', zValidator('json', medicationSchema), async (c) => {
    const body = c.req.valid('json');
    const organizationId = c.get('organizationId');

    // Anti-IDOR
    await verifyPatientAccess(body.patientId, organizationId);

    const [med] = await db.insert(patientMedications).values({
        organizationId,
        patientId: body.patientId,
        name: body.name,
        dosage: body.dosage,
        frequency: body.frequency,
        status: 'active',
        startDate: body.startDate ? new Date(body.startDate).toISOString() : undefined
    }).returning();

    return c.json(med);
});

// --- CONSENTS ---
app.get('/consents/:patientId', async (c) => {
    const patientId = Number(c.req.param('patientId'));
    const organizationId = c.get('organizationId');

    const consents = await db.select().from(patientConsents)
        .where(and(eq(patientConsents.patientId, patientId), eq(patientConsents.organizationId, organizationId)));

    return c.json(consents);
});

app.post('/consents', zValidator('json', consentSchema), async (c) => {
    const body = c.req.valid('json');
    const organizationId = c.get('organizationId');
    const user = c.get('user');

    // Anti-IDOR
    await verifyPatientAccess(body.patientId, organizationId);

    const [consent] = await db.insert(patientConsents).values({
        organizationId,
        patientId: body.patientId,
        title: body.title,
        content: body.content,
        signedByIp: c.req.header('x-forwarded-for') || 'unknown',
        userAgent: c.req.header('user-agent'),
        signedAt: new Date()
    }).returning();

    logAudit({
        userId: user.id,
        action: 'SIGN_CONSENT',
        resourceType: 'consent',
        resourceId: consent.id,
        tenantId: organizationId,
        ip: c.req.header('x-forwarded-for') || 'unknown',
        details: { patientId: body.patientId, title: body.title }
    });

    return c.json(consent);
});

// --- ODONTOGRAM ---
app.get('/odontogram/:patientId', async (c) => {
    const patientId = Number(c.req.param('patientId'));
    const organizationId = c.get('organizationId');

    const teeth = await db.select().from(odontogram)
        .where(and(eq(odontogram.patientId, patientId), eq(odontogram.organizationId, organizationId)));

    return c.json(teeth);
});

app.post('/odontogram', zValidator('json', odontogramSchema), async (c) => {
    const body = c.req.valid('json');
    const organizationId = c.get('organizationId');

    // Anti-IDOR
    await verifyPatientAccess(body.patientId, organizationId);

    // We expect a single tooth update or an array?
    // Let's handle generic "Upsert" logic
    // If it exists (same patient, tooth, surface?), update it. 
    // Actually, traditionally Odontogram has 1 entry per condition per tooth.

    // Simple implementation: Insert new record for history trace
    // Ideally we would update "status=old" for previous entries of same tooth/surface if needed
    // checking if we want to overwrite 'current'.

    // First, if we are marking a new condition "current", set others for this tooth/surface to history?
    // Simplifying: Just insert new status.

    const [entry] = await db.insert(odontogram).values({
        organizationId,
        patientId: body.patientId,
        tooth: body.tooth,
        surface: body.surface || 'whole',
        condition: body.condition,
        material: body.material,
        notes: body.notes,
        status: 'current'
    }).returning();

    // W1.3 Odontogram Timeline
    const user = c.get('user');
    if (user) {
        logTimelineEvent({
            organizationId,
            patientId: body.patientId,
            eventType: 'clinical',
            refType: 'odontogram',
            refId: String(entry.id),
            title: `Odontograma: Dente ${body.tooth}`,
            summary: `${body.condition} (${body.surface})`,
            createdBy: user.id
        });
    }

    return c.json(entry);
});

// --- IMAGES ---
app.get('/images/:patientId', async (c) => {
    const patientId = Number(c.req.param('patientId'));
    const organizationId = c.get('organizationId');

    // Fetch documents where type is 'photo' or 'image'
    // 'documents' table has 'type' field
    const images = await db.select().from(documents)
        .where(and(
            eq(documents.patientId, patientId),
            eq(documents.organizationId, organizationId),
            // We can filter by type here or in frontend. Let's send all 'media' types
            // For now, let's assume all documents with extension jpg/png are images or check 'type'
        ));

    // P4. LGPD Access Log
    await logAccess({
        organizationId,
        userId: c.get('user').id,
        patientId,
        action: 'VIEW',
        resourceType: 'patient_images',
        ip: c.req.header('x-forwarded-for'),
        userAgent: c.req.header('user-agent'),
    });

    return c.json(images.filter(d =>
        d.type === 'photo' ||
        d.url.match(/\.(jpg|jpeg|png|webp|gif)$/i)
    ));
});



// --- TREATMENT PLANS ---
app.get('/plans/:patientId', async (c) => {
    const patientId = Number(c.req.param('patientId'));
    const organizationId = c.get('organizationId');

    // Fetch plans with items
    const plans = await db.query.treatmentPlans.findMany({
        where: and(eq(treatmentPlans.patientId, patientId), eq(treatmentPlans.organizationId, organizationId)),
        with: {
            items: true
        },
        orderBy: desc(treatmentPlans.createdAt)
    });

    return c.json(plans);
});

app.post('/plans', zValidator('json', planSchema), async (c) => {
    const body = c.req.valid('json');
    const organizationId = c.get('organizationId');
    const user = c.get('user');

    // Anti-IDOR
    await verifyPatientAccess(body.patientId, organizationId);

    // Transactional insert for Plan + Items
    const result = await db.transaction(async (tx) => {
        const [plan] = await tx.insert(treatmentPlans).values({
            organizationId,
            patientId: body.patientId,
            title: body.title,
            status: 'draft',
            totalCost: body.totalCost ? String(body.totalCost) : null,
            dentistId: user.id
        }).returning();

        if (body.items && body.items.length > 0) {
            await tx.insert(planItems).values(
                body.items.map((item: any) => ({
                    planId: plan.id,
                    name: item.name,
                    price: String(item.price), // Cast to string for numeric
                    procedureId: item.procedureId || null,
                    tooth: item.tooth,
                    surface: item.surface
                }))
            );
        }

        return plan;
    });

    return c.json(result);
});

// POST /api/records/encounters (Start/Draft)
app.post('/encounters', zValidator('json', encounterSchema), async (c) => {
    const user = c.get('user');
    const organizationId = c.get('organizationId');
    const dentistId = c.get('userId'); // Clerk ID string

    const body = c.req.valid('json');

    checkTenantAccess(user, organizationId, 'create_clinical_record');
    // Anti-IDOR
    await verifyPatientAccess(body.patientId, organizationId);

    const [newEncounter] = await db.insert(encounters).values({
        organizationId,
        dentistId,
        patientId: body.patientId,
        type: body.type,
        subjective: body.subjective,
        objective: body.objective,
        assessment: body.assessment,
        plan: body.plan,
        appointmentId: body.appointmentId,
        status: 'draft',
        date: new Date().toISOString()
    } as any).returning();

    // W1.2 Timeline Event
    logTimelineEvent({
        organizationId,
        patientId: body.patientId,
        eventType: 'clinical',
        refType: 'encounter',
        refId: String(newEncounter.id),
        title: `Atendimento Iniciado (${body.type})`,
        createdBy: user.id
    });

    return c.json({ ok: true, data: newEncounter });
});

// PUT /api/records/encounters/:id (Update)
app.put('/encounters/:id', zValidator('json', encounterSchema.partial()), async (c) => {
    const id = Number(c.req.param('id'));
    const user = c.get('user');
    const organizationId = c.get('organizationId');
    const body = c.req.valid('json');

    // Verify ownership or permission
    const existing = await db.select().from(encounters).where(and(eq(encounters.id, id), eq(encounters.organizationId, organizationId))).limit(1);

    if (!existing.length) return c.json({ error: 'Not found' }, 404);

    // W1.1 Status Lock Check
    const lockReason = getLockReason(existing[0]);
    if (lockReason) {
        return c.json({ error: lockReason }, 403);
    }

    const [updated] = await db.update(encounters)
        .set({
            ...body,
            updatedAt: new Date()
        })
        .where(eq(encounters.id, id))
        .returning();

    // Log meaningful updates? Or just keeping the noise low. Only log major state changes.

    return c.json({ ok: true, data: updated });
});

// POST /api/records/encounters/:id/sign (Finalize)
app.post('/encounters/:id/sign', requireMfa, async (c) => {
    const id = Number(c.req.param('id'));
    const user = c.get('user');
    const organizationId = c.get('organizationId');

    const existing = await db.select().from(encounters).where(and(eq(encounters.id, id), eq(encounters.organizationId, organizationId))).limit(1);
    if (!existing.length) return c.json({ error: 'Not found' }, 404);

    const [signed] = await db.update(encounters)
        .set({
            status: 'signed',
            signedAt: new Date(),
            signedBy: user.id
        })
        .where(eq(encounters.id, id))
        .returning();

    // W1.2 Timeline Event
    logTimelineEvent({
        organizationId,
        patientId: existing[0].patientId,
        eventType: 'clinical',
        refType: 'encounter',
        refId: String(id),
        title: `Atendimento Assinado`,
        summary: `Assinado por ${user.name}`,
        createdBy: user.id
    });

    logAudit({
        userId: user.id,
        action: 'SIGN_ENCOUNTER',
        resourceType: 'encounter',
        resourceId: id,
        tenantId: organizationId,
        ip: c.req.header('x-forwarded-for') || 'unknown',
        details: { encounterId: id }
    });

    return c.json({ ok: true, data: signed });
});

export default app;
