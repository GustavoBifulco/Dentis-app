import { Hono } from 'hono';
import { db } from '../db';
import { anamnesisTemplates, anamnesisQuestions, anamnesisResponses, patients } from '../db/schema';
import { eq, and, asc, desc } from 'drizzle-orm';
import { authMiddleware } from '../middleware/auth';

const app = new Hono();

app.use('*', authMiddleware);

// Get the active anamnesis template for the organization (or create a default one)
app.get('/template', async (c) => {
    const auth = c.get('auth');

    // Try to find an active template
    const templates = await db.select().from(anamnesisTemplates)
        .where(and(
            eq(anamnesisTemplates.organizationId, auth.organizationId),
            eq(anamnesisTemplates.isActive, true)
        ))
        .limit(1);

    if (templates.length > 0) {
        const template = templates[0];
        const questions = await db.select().from(anamnesisQuestions)
            .where(eq(anamnesisQuestions.templateId, template.id))
            .orderBy(asc(anamnesisQuestions.order));

        return c.json({ template, questions });
    }

    // CREATE DEFAULT TEMPLATE IF NONE EXISTS
    const [newTemplate] = await db.insert(anamnesisTemplates).values({
        organizationId: auth.organizationId,
        title: 'Anamnese Padrão',
        description: 'Questionário básico de saúde e histórico odontológico.'
    }).returning();

    const questionsData = [
        { section: 'Saúde Geral', text: 'Você está sob tratamento médico atualmente?', type: 'yes_no', order: 1, linkedField: 'medicalHistory' },
        { section: 'Saúde Geral', text: 'Possui alguma alergia a medicamentos?', type: 'text', order: 2, linkedField: 'allergies' },
        { section: 'Saúde Geral', text: 'Toma algum medicamento de uso contínuo?', type: 'long_text', order: 3, linkedField: 'medications' },
        { section: 'Histórico Odontológico', text: 'Qual o motivo principal da sua consulta?', type: 'checkbox', options: JSON.stringify(['Dor', 'Estética', 'Limpeza', 'Implante', 'Ortodontia', 'Outro']), order: 4 },
        { section: 'Histórico Odontológico', text: 'Sente sensibilidade nos dentes?', type: 'yes_no', order: 5 },
        { section: 'Histórico Odontológico', text: 'Já teve problemas com anestesia dentária?', type: 'yes_no', order: 6 },
        { section: 'Histórico Odontológico', text: 'Sangra as gengivas ao escovar ou usar fio dental?', type: 'yes_no', order: 7 },
    ];

    await db.insert(anamnesisQuestions).values(questionsData.map(q => ({
        templateId: newTemplate.id,
        ...q
    })));

    const questions = await db.select().from(anamnesisQuestions)
        .where(eq(anamnesisQuestions.templateId, newTemplate.id))
        .orderBy(asc(anamnesisQuestions.order));

    return c.json({ template: newTemplate, questions });
});

// Get responses for a specific patient
app.get('/responses/:patientId', async (c) => {
    const patientId = parseInt(c.req.param('patientId'));
    const auth = c.get('auth');

    // Check if patient belongs to org
    const patientCheck = await db.select().from(patients)
        .where(and(eq(patients.id, patientId), eq(patients.organizationId, auth.organizationId)))
        .limit(1);

    if (patientCheck.length === 0) return c.json({ error: 'Patient not found' }, 404);

    const responses = await db.select().from(anamnesisResponses)
        .where(eq(anamnesisResponses.patientId, patientId))
        .orderBy(desc(anamnesisResponses.updatedAt))
        .limit(1);

    return c.json(responses[0] || null);
});

// Save responses
app.post('/responses', async (c) => {
    const auth = c.get('auth');
    const { patientId, templateId, answers } = await c.req.json();

    // Verify patient
    const [existingPatient] = await db.select().from(patients)
        .where(and(eq(patients.id, patientId), eq(patients.organizationId, auth.organizationId)))
        .limit(1);

    if (!existingPatient) return c.json({ error: 'Patient not found' }, 404);

    // Save/Update response
    // Check if exists first to update or insert new? 
    // Usually anamnesis is a snapshot, but for simplicity here we might update the single active record or create a new one.
    // Let's upsert matching patientId and templateId to keep it simple for now, or insert new history.
    // Given the requirement "linked to database so clinic can edit", keeping history is good, but let's stick to "Current Anamnesis" for this iteration + History later.
    // Actually, simply inserting a new record is safer for history.

    // However, we need to SYNC with patients table fields
    const questions = await db.select().from(anamnesisQuestions).where(eq(anamnesisQuestions.templateId, templateId));

    const updates: any = {};
    questions.forEach(q => {
        if (q.linkedField && answers[q.id.toString()]) {
            updates[q.linkedField] = answers[q.id.toString()];
        }
    });

    if (Object.keys(updates).length > 0) {
        await db.update(patients)
            .set(updates)
            .where(eq(patients.id, patientId));
    }

    // Check if response exists
    const [existingResponse] = await db.select().from(anamnesisResponses)
        .where(and(eq(anamnesisResponses.patientId, patientId), eq(anamnesisResponses.templateId, templateId))).limit(1);

    if (existingResponse) {
        const [updated] = await db.update(anamnesisResponses)
            .set({ answers, updatedAt: new Date() })
            .where(eq(anamnesisResponses.id, existingResponse.id))
            .returning();
        return c.json(updated);
    } else {
        const [inserted] = await db.insert(anamnesisResponses)
            .values({ patientId, templateId, answers })
            .returning();
        return c.json(inserted);
    }
});

export default app;
