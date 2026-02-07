import { Hono } from 'hono';
import whatsappService from '../services/whatsapp';
import { checkWhatsAppQuota, logWhatsAppUsage } from '../lib/usageTracking';
import { authMiddleware } from '../middleware/auth';

const app = new Hono();

/**
 * Webhook verification (GET)
 * Meta will call this to verify your webhook
 */
app.get('/webhook', (c) => {
    const mode = c.req.query('hub.mode');
    const token = c.req.query('hub.verify_token');
    const challenge = c.req.query('hub.challenge');

    const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN || 'dentis_webhook_2024';

    if (mode === 'subscribe' && token === verifyToken) {
        console.log('✅ WhatsApp webhook verified');
        return c.text(challenge || '');
    }

    console.warn('⚠️ WhatsApp webhook verification failed');
    return c.json({ error: 'Forbidden' }, 403);
});

/**
 * Webhook receiver (POST)
 * Receives incoming WhatsApp messages
 */
app.post('/webhook', async (c) => {
    try {
        const body = await c.req.json();

        // Parse the webhook
        const result = whatsappService.parseWebhook(body);

        if (!result.from || !result.text) {
            // Not a text message or invalid
            return c.json({ status: 'ignored' });
        }

        console.log(`📱 WhatsApp message from ${result.from}: ${result.text}`);

        // TODO: Handle the message based on your business logic
        // For example:
        // - If it's a confirmation, update appointment status
        // - If it's a question, trigger AI assistant
        // - Store in database for later processing

        // Mark as read
        const messageId = body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0]?.id;
        if (messageId) {
            await whatsappService.markAsRead(messageId);
        }

        return c.json({ status: 'ok' });
    } catch (error: any) {
        console.error('❌ WhatsApp webhook error:', error);
        return c.json({ error: error.message }, 500);
    }
});

/**
 * Send a message (with quota check)
 */
app.post('/send', authMiddleware, async (c) => {
    try {
        const { to, text, organizationId, userId } = await c.req.json();

        if (!to || !text) {
            return c.json({ error: 'Missing required fields: to, text' }, 400);
        }

        // Check quota
        if (organizationId) {
            try {
                await checkWhatsAppQuota(organizationId);
            } catch (quotaError: any) {
                return c.json({ error: quotaError.message }, 429);
            }
        }

        // Send message
        const result = await whatsappService.sendMessage(to, text);

        // Log usage
        if (result.ok && organizationId && userId) {
            await logWhatsAppUsage(organizationId, userId, 1);
        }

        return c.json(result);
    } catch (error: any) {
        console.error('❌ WhatsApp send error:', error);
        return c.json({ error: error.message }, 500);
    }
});

/**
 * Send a template message (with quota check)
 */
app.post('/send-template', authMiddleware, async (c) => {
    try {
        const { to, templateName, vars, organizationId, userId } = await c.req.json();

        if (!to || !templateName) {
            return c.json({ error: 'Missing required fields: to, templateName' }, 400);
        }

        // Check quota
        if (organizationId) {
            try {
                await checkWhatsAppQuota(organizationId);
            } catch (quotaError: any) {
                return c.json({ error: quotaError.message }, 429);
            }
        }

        // Send template
        const result = await whatsappService.sendTemplate(to, templateName, vars || {});

        // Log usage
        if (result.ok && organizationId && userId) {
            await logWhatsAppUsage(organizationId, userId, 1);
        }

        return c.json(result);
    } catch (error: any) {
        console.error('❌ WhatsApp template send error:', error);
        return c.json({ error: error.message }, 500);
    }
});

export default app;
