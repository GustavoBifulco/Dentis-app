import 'dotenv/config'; // Importa variáveis do .env
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { serve } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';

import onboarding from './routes/onboarding';
// TEMPORARILY DISABLED - Schema migration needed
// import profile from './routes/profile';
import inventory from './routes/inventory';
import procedures from './routes/procedures';
import patients from './routes/patients';
import debug from './routes/debug';
import checkout from './routes/checkout';
// import ai from './routes/ai';
// import appointments from './routes/appointments';
// import clinical from './routes/clinical';
// import finance from './routes/finance';
// import fiscal from './routes/fiscal';
// import kiosk from './routes/kiosk';
// import marketing from './routes/marketing';
import uploads from './routes/uploads';
import orders from './routes/orders';
import patient from './routes/patient';

const app = new Hono();

app.use('*', async (c, next) => {
  console.log(`🌐 [${c.req.method}] ${c.req.url}`);
  await next();
});

app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'x-user-id'],
}));

// --- MANIPULADORES GLOBAIS DE ERRO ---
app.onError((err, c) => {
  console.error("🔥 Erro Global no Servidor:", err);
  return c.json({
    success: false,
    error: err.message || "Erro interno no servidor",
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  }, 500);
});

app.notFound(async (c) => {
  if (c.req.path.startsWith('/api')) {
    return c.json({ success: false, error: `Rota não encontrada: ${c.req.path}` }, 404);
  }
  const res = await serveStatic({ path: './dist/index.html' })(c, () => Promise.resolve());
  return res || c.text('Not Found', 404);
});


// Feature guards - temporarily disabled routes
// app.use('/api/appointments/*', featureGuard('VITE_ENABLE_CLINIC_MANAGEMENT'));
// app.use('/api/clinical/*', featureGuard('VITE_ENABLE_CLINIC_MANAGEMENT'));
// app.use('/api/finance/*', featureGuard('VITE_ENABLE_CLINIC_MANAGEMENT'));
// app.use('/api/patients/*', featureGuard('VITE_ENABLE_CLINIC_MANAGEMENT'));

import { featureGuard } from './middleware/featureGuard';

import dashboard from './routes/dashboard';

// ...
app.route('/api/dashboard', dashboard);
// app.route('/api/profile', profile); // DISABLED - schema migration needed
// ...
app.route('/api/onboarding', onboarding);
app.route('/api/inventory', inventory);
app.route('/api/procedures', procedures);
app.route('/api/patients', patients);
app.route('/api/debug', debug);
app.route('/api/checkout', checkout);
// TEMPORARILY DISABLED - Schema migration needed:
// app.route('/api/ai', ai);
// app.route('/api/appointments', appointments);
// app.route('/api/clinical', clinical);
// app.route('/api/finance', finance);
// app.route('/api/fiscal', fiscal);
// app.route('/api/kiosk', kiosk);
// app.route('/api/marketing', marketing);
app.route('/api/uploads', uploads);
app.route('/api/orders', orders);
app.route('/api/patient', patient);

import courier from './routes/courier';
import lab from './routes/lab';
import invites from './routes/invites';

// app.route('/api/invites', invites); // DISABLED - schema migration needed
app.route('/api/courier', courier);
app.route('/api/lab', lab);

app.get('/api', (c) => c.json({ status: 'online', version: '1.0.0' }));
app.use('/assets/*', serveStatic({ root: './dist' }));
app.get('*', serveStatic({ path: './dist/index.html' }));

console.log("🚀 Servidor Dentis Online na porta 3000");
serve({ fetch: app.fetch, port: 3000 });
