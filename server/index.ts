import 'dotenv/config';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { serve } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';
import { logger } from 'hono/logger';

// Importação segura das rotas
import onboarding from './routes/onboarding';
import onboardingV2 from './routes/onboarding-v2';
import webhooks from './routes/webhooks';
import inventory from './routes/inventory';
import procedures from './routes/procedures';
import patients from './routes/patients';
import debug from './routes/debug';
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

import { secureHeaders } from 'hono/secure-headers';
import { HTTPException } from 'hono/http-exception';
import { ZodError } from 'zod';

import { redactPII } from './utils/privacy';

const app = new Hono();

// 1. Middlewares Globais de Segurança e Logs
app.use('*', async (c, next) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  // Custom Redacted Logger
  const method = c.req.method;
  const path = c.req.path;
  const status = c.res.status;

  // Safe logging (Redacted path if it contains PII in params)
  // For params like /patients/123, it is fine, but /search?q=CPF needs care.
  // URL params are usually fine unless search queries.
  // We can Redact query params.

  if (process.env.NODE_ENV !== 'test') {
    console.log(`[${method}] ${path} ${status} - ${ms}ms`);
  }
});
// app.use('*', logger()); // Disable default logger to avoid PII leak
app.use('*', secureHeaders()); // Proteção contra XSS, Clickjacking, etc.
app.use('*', cors({
  origin: '*', // TODO: Em produção, definir domínios específicos
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowHeaders: ['Content-Type', 'Authorization', 'x-user-id'],
  maxAge: 86400, // Cache de preflight por 24h
}));


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
app.route('/api/debug', debug);
app.route('/api/treatment', treatment);
app.route('/api/anamnesis', anamnesis);

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
