import 'dotenv/config';
import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';
import { logger } from 'hono/logger';
import { securityHeaders, bodyLimit, secureCors } from './middleware/security';

// Importação segura das rotas
import onboarding from './routes/onboarding';
import onboardingV2 from './routes/onboarding-v2';
import webhooks from './routes/webhooks';
import inventory from './routes/inventory';
import procedures from './routes/procedures';
import patients from './routes/patients';
// import debug from './routes/debug'; // REMOVED FOR SECURITY
import checkout from './routes/checkout';
import ai from './routes/ai';
import appointments from './routes/appointments';
import appointmentRequests from './routes/appointment-requests';
import clinical from './routes/clinical';
import finance from './routes/finance';
import fiscal from './routes/fiscal';
import kiosk from './routes/kiosk';
import marketing from './routes/marketing';
import uploads from './routes/uploads';
import orders from './routes/orders';
import patient from './routes/patient';
import courier from './routes/courier';
import lab from './routes/lab';
import dashboard from './routes/dashboard';
import session from './routes/session';
import auth from './routes/auth';
import chat from './routes/chat';
import telehealth from './routes/telehealth';
import patientImport from './routes/patient-import';
import patientInvite from './routes/patient-invite';
import treatment from './routes/treatment';
import anamnesis from './routes/anamnesis';
import settings from './routes/settings';
import records from './routes/records';
import whatsapp from './routes/whatsapp';

// import { secureHeaders } from 'hono/secure-headers'; // Removed in favor of middleware/security
import { HTTPException } from 'hono/http-exception';
import { ZodError } from 'zod';

import { redactPII } from './utils/privacy';
import { features, logFeatureStatus, validateCriticalFeatures } from './lib/features';
import { generalRateLimit } from './middleware/rateLimit';

// Validate critical features at startup
try {
  validateCriticalFeatures();
  logFeatureStatus();
} catch (error) {
  console.error(error);
  process.exit(1);
}

const app = new Hono();

// 1. Middlewares Globais de Segurança e Logs
import { requestLogger } from './middleware/logger';
app.use('*', requestLogger);
app.use('*', securityHeaders);
app.use('*', secureCors);
app.use('*', bodyLimit(10 * 1024 * 1024)); // 10MB Global Limit (Uploads routes might need specific handling if larger, but 10MB is generally enough)
app.use('*', generalRateLimit);

// app.use('*', logger()); // Disable default logger to avoid PII leak


// Rotas da API
app.route('/api/auth', auth);
app.route('/api/onboarding', onboarding);
app.route('/api/onboarding-v2', onboardingV2); // Nova rota simplificada
app.route('/api/webhooks', webhooks); // Stripe webhooks
app.route('/api/inventory', inventory);
app.route('/api/procedures', procedures);
app.route('/api/patients', patients);
app.route('/api/patient', patient); // Check conflicts later
app.route('/api/appointments', appointments);
app.route('/api/appointment-requests', appointmentRequests);
app.route('/api/clinical', clinical);
app.route('/api/records', records); // NEW: Clinical Records (Phase 1)
app.route('/api/finance', finance);
app.route('/api/fiscal', fiscal);
app.route('/api/kiosk', kiosk);
app.route('/api/marketing', marketing);
app.route('/api/uploads', uploads);
app.route('/api/orders', orders);
app.route('/api/courier', courier);
app.route('/api/lab', lab);
app.route('/api/dashboard', dashboard);
app.route('/api/session', session);
app.route('/api/checkout', checkout);
app.route('/api/ai', ai);
app.route('/api/chat', chat);
app.route('/api/telehealth', telehealth);
app.route('/api/patient-import', patientImport);
app.route('/api/patient-invite', patientInvite);
app.route('/api/patient-invite', patientInvite);
// app.route('/api/debug', debug); // REMOVED FOR SECURITY
app.route('/api/treatment', treatment);
app.route('/api/anamnesis', anamnesis);
app.route('/api/settings', settings);

import automations from './routes/automations';

// ... (existing imports)

// ... (existing routes)
import communication from './routes/communication';
import preferences from './routes/preferences';

// ... (existing routes)
app.route('/api/settings', settings);
app.route('/api/communication', communication);
app.route('/api/whatsapp', whatsapp);
app.route('/api/preferences', preferences);
import billingProvisioning from './routes/billing-provisioning';
import clinicInvites from './routes/clinic-invites';

app.route('/api/billing-provisioning', billingProvisioning);
app.route('/api/clinic-invites', clinicInvites);

import billing from './routes/billing';
app.route('/api/billing', billing);

app.get('/health', (c) => c.json({ status: 'ok', uptime: process.uptime() }));


// 5. Tratamento de Erros Global Aprimorado
app.onError((err, c) => {
  if (err instanceof HTTPException) {
    return err.getResponse();
  }

  if (err instanceof ZodError) {
    return c.json({
      success: false,
      error: "Validation Error",
      details: err.errors
    }, 400);
  }

  console.error("🔥 Erro Global:", err);
  return c.json({
    success: false,
    error: "Erro interno no servidor",
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  }, 500);
});

// 6. Servir Frontend (Arquivos Estáticos)
// Primeiro tenta servir arquivos da pasta assets
app.use('/assets/*', serveStatic({ root: './dist' }));

// Para qualquer outra rota não-API, serve o index.html (SPA)
app.get('*', serveStatic({
  path: './dist/index.html',
  onNotFound: (path, c) => {
    console.log(`⚠️ Arquivo não encontrado: ${path}`);
    return undefined; // Continua para o próximo handler
  }
}));

// Fallback final
app.notFound((c) => {
  if (c.req.path.startsWith('/api')) {
    return c.json({ error: 'Endpoint API não encontrado' }, 404);
  }
  return c.text('Página não encontrada', 404);
});

const port = Number(process.env.PORT) || 3000;

console.log(`🚀 Servidor Dentis rodando na porta ${port}`);

serve({
  fetch: app.fetch,
  port: port,
  hostname: '0.0.0.0' // <--- ISSO É OBRIGATÓRIO
})
