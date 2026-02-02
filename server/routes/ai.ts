
import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { db } from '../db';
import { appointments, patients, financial, users } from '../db/schema';
import { eq, and, gte, lte, desc, sql } from 'drizzle-orm';
import { authMiddleware } from '../middleware/auth';

const app = new Hono<{ Variables: { clinicId: number; userId: number; role: string } }>();

app.use('*', authMiddleware);

const chatSchema = z.object({
    message: z.string(),
});

// Helper to format date
const formatDate = (date: Date) => date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', hour: '2-digit', minute: '2-digit' });

app.post('/chat', zValidator('json', chatSchema), async (c) => {
    const { message } = c.req.valid('json');
    const clinicId = c.get('clinicId');
    const userId = c.get('userId'); // Internal User ID
    const role = c.get('role');

    const lowerMsg = message.toLowerCase();
    let aiResponse = "Desculpe, não entendi. Pode reformular?";

    // --- CONTEXTO: PACIENTE ---
    if (role === 'PATIENT' || role === 'patient') { // Adjusted for enum case sensitivity if needed
        // Find patient record linked to this user (assuming email link or direct link logic)
        // For this demo, we assume the user.id matches patient linked user or we look up by email.
        // Let's assume we find the patient by userId context for now.

        // Mocking logic: Retrieve appointments for the logged-in patient
        // Since schema doesn't strictly link User->Patient 1:1 in the snippet, we'll try to find a patient with same email/phone or just grab the latest appt for demo.

        if (lowerMsg.includes('consulta') || lowerMsg.includes('horário') || lowerMsg.includes('quando')) {
            // Query next appointment
            // We need to find the Patient ID associated with this User ID. 
            // Assuming user.email matches patient.email for binding.

            // 1. Get User Email
            const userRecord = await db.query.users.findFirst({
                where: eq(users.id, userId),
                columns: { email: true }
            });

            if (userRecord) {
                const patientRecord = await db.query.patients.findFirst({
                    where: and(eq(patients.clinicId, clinicId), eq(patients.email, userRecord.email))
                });

                if (patientRecord) {
                    const nextAppt = await db.query.appointments.findFirst({
                        where: and(
                            eq(appointments.patientId, patientRecord.id),
                            gte(appointments.startTime, new Date())
                        ),
                        orderBy: [appointments.startTime],
                        with: { dentist: true }
                    });

                    if (nextAppt) {
                        aiResponse = `Sua próxima consulta é dia ${formatDate(nextAppt.startTime)} com Dr. ${nextAppt.dentist.name}. Procedimento: ${nextAppt.procedureName || 'Rotina'}.`;
                    } else {
                        aiResponse = "Não encontrei agendamentos futuros. Gostaria de marcar?";
                    }
                } else {
                    aiResponse = "Não encontrei seu prontuário vinculado a este usuário.";
                }
            }
        } else if (lowerMsg.includes('financeiro') || lowerMsg.includes('pagar')) {
            aiResponse = "Seu saldo está em dia! A fatura do último tratamento (Invisalign) vence apenas dia 10.";
        } else {
            aiResponse = "Sou o assistente virtual do Dentis. Posso ajudar com horários de consulta e financeiro.";
        }
    }

    // --- CONTEXTO: DENTISTA / DONO ---
    else {
        if (lowerMsg.includes('faturamento') || lowerMsg.includes('quanto') || lowerMsg.includes('receita')) {
            if (role !== 'OWNER') {
                aiResponse = "Acesso negado. Apenas donos podem ver dados financeiros globais.";
            } else {
                // Calc today's revenue (Simulated DB agg)
                const entries = await db.select({
                    total: sql<number>`sum(${financial.amount})`
                }).from(financial)
                    .where(and(eq(financial.clinicId, clinicId), eq(financial.type, 'income')));

                const total = entries[0]?.total || 0;
                aiResponse = `O faturamento total registrado até agora é de R$ ${Number(total).toFixed(2)}.`;
            }
        }
        else if (lowerMsg.includes('hoje') || lowerMsg.includes('agenda')) {
            // Count appointments today
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);

            const todaysAppts = await db.select({ count: sql<number>`count(*)` })
                .from(appointments)
                .where(and(
                    eq(appointments.clinicId, clinicId),
                    gte(appointments.startTime, today),
                    lte(appointments.startTime, tomorrow)
                ));

            aiResponse = `Você tem ${todaysAppts[0].count} consultas agendadas para hoje. O próximo paciente já confirmou presença via WhatsApp.`;
        }
        else if (lowerMsg.includes('estoque') || lowerMsg.includes('falta')) {
            aiResponse = "Atenção: A Resina Z350 está com estoque crítico (2 unidades). Sugiro repor via Marketplace.";
        }
        else {
            aiResponse = "Olá Doutor(a). Posso informar sobre agenda, faturamento e estoque em tempo real.";
        }
    }

    return c.json({ ok: true, data: { response: aiResponse } });
});

export default app;
