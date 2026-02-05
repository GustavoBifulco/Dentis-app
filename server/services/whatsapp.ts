/**
 * WhatsApp Business Cloud API Integration
 * Docs: https://developers.facebook.com/docs/whatsapp/cloud-api
 */

export type TemplateVars = Record<string, string | number>;

export type WhatsAppWebhookResult = {
  from?: string;
  text: string;
  confirmed: boolean;
};

interface WhatsAppConfig {
  apiKey: string;
  phoneNumberId: string;
  apiVersion: string;
}

export class WhatsAppService {
  private config: WhatsAppConfig;
  private baseUrl: string;

  constructor() {
    this.config = {
      apiKey: process.env.WHATSAPP_API_KEY || '',
      phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || '',
      apiVersion: 'v18.0',
    };
    this.baseUrl = `https://graph.facebook.com/${this.config.apiVersion}/${this.config.phoneNumberId}`;
  }

  /**
   * Send a text message via WhatsApp Cloud API
   */
  async sendMessage(to: string, text: string): Promise<{ ok: boolean; id?: string; error?: string }> {
    if (!this.config.apiKey || !this.config.phoneNumberId) {
      console.warn('[WhatsApp] API not configured, using mock mode');
      return { ok: true, id: `mock_${Date.now()}` };
    }

    try {
      // Remove non-numeric characters from phone
      const cleanPhone = to.replace(/\D/g, '');

      const response = await fetch(`${this.baseUrl}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: cleanPhone,
          type: 'text',
          text: { body: text },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('[WhatsApp] Send failed:', data);
        return { ok: false, error: data.error?.message || 'Unknown error' };
      }

      return { ok: true, id: data.messages?.[0]?.id };
    } catch (error: any) {
      console.error('[WhatsApp] Send error:', error);
      return { ok: false, error: error.message };
    }
  }

  /**
   * Send a template message (requires pre-approved template)
   */
  async sendTemplate(
    phone: string,
    templateName: string,
    vars: TemplateVars,
    languageCode: string = 'pt_BR'
  ): Promise<{ ok: boolean; id?: string; error?: string }> {
    if (!this.config.apiKey || !this.config.phoneNumberId) {
      console.warn('[WhatsApp] API not configured, using mock mode');
      return { ok: true, id: `mock_${Date.now()}` };
    }

    try {
      const cleanPhone = phone.replace(/\D/g, '');

      // Convert vars to WhatsApp template parameters format
      const parameters = Object.values(vars).map(value => ({
        type: 'text',
        text: String(value),
      }));

      const response = await fetch(`${this.baseUrl}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: cleanPhone,
          type: 'template',
          template: {
            name: templateName,
            language: { code: languageCode },
            components: [
              {
                type: 'body',
                parameters,
              },
            ],
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('[WhatsApp] Template send failed:', data);
        return { ok: false, error: data.error?.message || 'Unknown error' };
      }

      return { ok: true, id: data.messages?.[0]?.id };
    } catch (error: any) {
      console.error('[WhatsApp] Template send error:', error);
      return { ok: false, error: error.message };
    }
  }

  /**
   * Parse incoming webhook from WhatsApp
   * Docs: https://developers.facebook.com/docs/whatsapp/cloud-api/webhooks/components
   */
  parseWebhook(body: any): WhatsAppWebhookResult {
    try {
      // WhatsApp Cloud API webhook format
      const entry = body?.entry?.[0];
      const change = entry?.changes?.[0];
      const message = change?.value?.messages?.[0];

      if (!message) {
        return { text: '', confirmed: false };
      }

      const from = message.from;
      const text = message.text?.body || '';

      const normalized = text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');

      const confirmed = ['sim', 'confirmar', 'confirmado', 'confirmo'].some(
        (word) => normalized === word || normalized.includes(word)
      );

      return { from, text, confirmed };
    } catch (error) {
      console.error('[WhatsApp] Webhook parse error:', error);
      return { text: '', confirmed: false };
    }
  }

  /**
   * Mark message as read
   */
  async markAsRead(messageId: string): Promise<boolean> {
    if (!this.config.apiKey || !this.config.phoneNumberId) {
      return true; // Mock mode
    }

    try {
      const response = await fetch(`${this.baseUrl}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          status: 'read',
          message_id: messageId,
        }),
      });

      return response.ok;
    } catch (error) {
      console.error('[WhatsApp] Mark as read error:', error);
      return false;
    }
  }
}

// Singleton instance
const whatsappService = new WhatsAppService();

/**
 * Helper function to send a simple text message
 */
export const sendMessage = async (to: string, text: string) => {
  return whatsappService.sendMessage(to, text);
};

/**
 * Helper function to send a template message
 */
export const sendTemplate = async (
  phone: string,
  templateName: string,
  vars: TemplateVars
) => {
  return whatsappService.sendTemplate(phone, templateName, vars);
};

export default whatsappService;
