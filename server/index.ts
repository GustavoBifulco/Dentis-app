import { webcrypto } from 'node:crypto';
if (typeof globalThis.crypto === 'undefined') {
  Object.defineProperty(globalThis, 'crypto', { value: webcrypto, writable: false, configurable: true });
}

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { serve } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';
import onboarding from './routes/onboarding';

const app = new Hono();

// LOG DE RASTREAMENTO: Mostra toda requisição que chega
app.use('*', async (c, next) => {
  console.log(`🌐 [${c.req.method}] ${c.req.url}`);
  await next();
});

app.use('*', cors());

// Rotas de API
app.route('/api/onboarding', onboarding);

// Serve Frontend
app.use('/assets/*', serveStatic({ root: './dist' }));
app.get('*', serveStatic({ path: './dist/index.html' }));

console.log("🚀 Servidor Dentis Online na porta 3000");
serve({ fetch: app.fetch, port: 3000 });
