export type TemplateVars = Record<string, string | number>;

export type WhatsAppWebhookResult = {
  from?: string;
  text: string;
  confirmed: boolean;
};

export class WhatsAppService {
  async sendTemplate(phone: string, templateName: string, vars: TemplateVars) {
    const payload = {
      to: phone,
      template: templateName,
      variables: vars,
    };

    // Placeholder for Twilio/WppConnect integration
    return {
      ok: true,
      provider: 'mock',
      messageId: `mock_${Date.now()}`,
      payload,
    };
  }

  parseWebhook(body: any): WhatsAppWebhookResult {
    const text =
      String(body?.Body || body?.message?.text || body?.message || '').trim() ||
      '';

    const normalized = text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

    const confirmed = ['sim', 'confirmar', 'confirmado', 'confirmo'].some(
      (word) => normalized === word || normalized.includes(word)
    );

    return {
      from: body?.From || body?.from || body?.sender,
      text,
      confirmed,
    };
  }
}
