import { Hono } from 'hono';
import { db } from '../db';
import { notificationPreferences } from '../db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod'; // Assuming zod is available or use validtor
import { zValidator } from '@hono/zod-validator';
import { sendEmail } from '../lib/email';

const app = new Hono();

// Schema de validação
const updatePreferencesSchema = z.object({
    emailAppointments: z.boolean().optional(),
    emailPayments: z.boolean().optional(),
    emailMarketing: z.boolean().optional(),
    securityAlerts: z.boolean().optional(),
    whatsappEnabled: z.boolean().optional(),
    pushEnabled: z.boolean().optional(),
});

// GET /notifications - Buscar preferências
app.get('/notifications', async (c) => {
    const userId = c.req.header('X-User-Id'); // Middleware de auth deve injetar isso ou pegar do token
    if (!userId) return c.json({ error: 'Unauthorized' }, 401);

    try {
        const prefs = await db.select().from(notificationPreferences).where(eq(notificationPreferences.userId, userId)).limit(1);

        if (prefs.length === 0) {
            // Retornar defaults se não existir
            return c.json({
                emailAppointments: true,
                emailPayments: true,
                emailMarketing: false,
                securityAlerts: true,
                whatsappEnabled: false,
                pushEnabled: false
            });
        }

        return c.json(prefs[0]);
    } catch (error) {
        console.error('Erro ao buscar preferências:', error);
        return c.json({ error: 'Internal Server Error' }, 500);
    }
});

// PUT /notifications - Atualizar preferências
app.put('/notifications', zValidator('json', updatePreferencesSchema), async (c) => {
    const userId = c.req.header('X-User-Id');
    if (!userId) return c.json({ error: 'Unauthorized' }, 401);

    const data = c.req.valid('json');

    try {
        // Tenta atualizar, se não existir cria (Upsert)
        // Drizzle ORM upsert syntax might vary based on driver, going with check-then-act for broad compatibility or simple insert on conflict if key exists

        // Check existing
        const existing = await db.select().from(notificationPreferences).where(eq(notificationPreferences.userId, userId));

        if (existing.length > 0) {
            await db.update(notificationPreferences)
                .set({ ...data, updatedAt: new Date() })
                .where(eq(notificationPreferences.userId, userId));
        } else {
            await db.insert(notificationPreferences).values({
                userId,
                ...data
            });
        }

        return c.json({ success: true, message: 'Preferências atualizadas' });
    } catch (error) {
        console.error('Erro ao salvar preferências:', error);
        return c.json({ error: 'Failed to update settings' }, 500);
    }
});

// POST /test-email - Endpoint para testar configuração SMTP
app.post('/test-email', async (c) => {
    const userId = c.req.header('X-User-Id');
    if (!userId) return c.json({ error: 'Unauthorized' }, 401);

    // Busca email do usuário (mock ou do banco se tivesse tabela de usuários sincronizada)
    // Como estamos usando Clerk no front, idealmente pegamos o email do profile,
    // mas aqui vamos aceitar um email no body para teste ou usar um fixo se não vier.
    const { to } = await c.req.json().catch(() => ({ to: null }));

    if (!to) {
        return c.json({ error: 'Email de destino obrigatório para teste.' }, 400);
    }

    const sent = await sendEmail({
        to,
        subject: 'Teste de Configuração - Dentis OS',
        html: `
        <h1>Olá!</h1>
        <p>Este é um email de teste para confirmar que o sistema de notificações do Dentis OS está conectado corretamente ao seu servidor SMTP.</p>
        <p>Se você está lendo isso, a configuração funcionou! 🎉</p>
        <br/>
        <p>Atenciosamente,<br/>Equipe Dentis</p>
      `
    });

    if (sent) {
        return c.json({ success: true, message: 'Email de teste enviado com sucesso!' });
    } else {
        return c.json({ success: false, error: 'Falha ao enviar email. Verifique os logs do servidor e as credenciais no .env.' }, 500);
    }
});

export default app;
