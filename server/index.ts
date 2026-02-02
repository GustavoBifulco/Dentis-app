import 'dotenv/config'; // Importa variáveis do .env
import { webcrypto } from 'node:crypto';
if (typeof globalThis.crypto === 'undefined') {
  Object.defineProperty(globalThis, 'crypto', { value: webcrypto, writable: false, configurable: true });
}

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { serve } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';

import onboarding from './routes/onboarding';
import inventory from './routes/inventory';
import procedures from './routes/procedures';
import patients from './routes/patients';
import debug from './routes/debug';
import checkout from './routes/checkout';
import ai from './routes/ai';
import appointments from './routes/appointments';
import clinical from './routes/clinical';
import finance from './routes/finance';
import fiscal from './routes/fiscal';
import kiosk from './routes/kiosk';
import marketing from './routes/marketing';
import uploads from './routes/uploads';

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

app.route('/api/onboarding', onboarding);
app.route('/api/inventory', inventory);
app.route('/api/procedures', procedures);
app.route('/api/patients', patients);
app.route('/api/debug', debug);
app.route('/api/checkout', checkout);
app.route('/api/ai', ai);
app.route('/api/appointments', appointments);
app.route('/api/clinical', clinical);
app.route('/api/finance', finance);
app.route('/api/fiscal', fiscal);
app.route('/api/kiosk', kiosk);
app.route('/api/marketing', marketing);
app.route('/api/uploads', uploads);

app.get('/api', (c) => c.json({ status: 'online', version: '1.0.0' }));
app.use('/assets/*', serveStatic({ root: './dist' }));
app.get('*', serveStatic({ path: './dist/index.html' }));

console.log("🚀 Servidor Dentis Online na porta 3000");
serve({ fetch: app.fetch, port: 3000 });
