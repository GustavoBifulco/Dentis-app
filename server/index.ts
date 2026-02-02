import 'dotenv/config';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { serve } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';
import { logger } from 'hono/logger';

// Importação segura das rotas
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
import orders from './routes/orders';
import patient from './routes/patient';
import courier from './routes/courier';
import lab from './routes/lab';
import dashboard from './routes/dashboard';

const app = new Hono();

// 1. Middlewares Globais
app.use('*', logger()); // Loga cada requisição
app.use('*', cors({
  origin: '*', // Em produção, mude para o domínio real
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowHeaders: ['Content-Type', 'Authorization', 'x-user-id'],
}));

// 2. Health Check (Vital para o Coolify não matar o app)
app.get('/api/health', (c) => c.json({ status: 'ok', uptime: process.uptime() }));
app.get('/api', (c) => c.json({ status: 'online', version: '1.0.0' }));

// 3. Função auxiliar para carregar rotas sem derrubar o servidor
const safeRoute = (path: string, routeModule: any, name: string) => {
  try {
    app.route(path, routeModule);
    console.log(`✅ Rota carregada: ${name}`);
  } catch (err) {
    console.error(`❌ Falha ao carregar rota ${name}:`, err);
  }
};

// 4. Carregamento das Rotas
safeRoute('/api/dashboard', dashboard, 'Dashboard');
safeRoute('/api/onboarding', onboarding, 'Onboarding');
safeRoute('/api/inventory', inventory, 'Inventory');
safeRoute('/api/procedures', procedures, 'Procedures');
safeRoute('/api/patients', patients, 'Patients');
safeRoute('/api/debug', debug, 'Debug');
safeRoute('/api/checkout', checkout, 'Checkout');
safeRoute('/api/ai', ai, 'AI');
safeRoute('/api/appointments', appointments, 'Appointments');
safeRoute('/api/clinical', clinical, 'Clinical');
safeRoute('/api/finance', finance, 'Finance');
safeRoute('/api/fiscal', fiscal, 'Fiscal');
safeRoute('/api/kiosk', kiosk, 'Kiosk');
safeRoute('/api/marketing', marketing, 'Marketing');
safeRoute('/api/uploads', uploads, 'Uploads');
safeRoute('/api/orders', orders, 'Orders');
safeRoute('/api/patient', patient, 'Patient Portal');
safeRoute('/api/courier', courier, 'Courier');
safeRoute('/api/lab', lab, 'Lab');

// 5. Tratamento de Erros Global
app.onError((err, c) => {
  console.error("🔥 Erro Global:", err);
  return c.json({ success: false, error: "Erro interno no servidor" }, 500);
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

const port = Number(process.env.PORT) || 3000

console.log(`🚀 Servidor Dentis rodando na porta ${port}`);

serve({
  fetch: app.fetch,
  port: port,
  hostname: '0.0.0.0' // <--- ISSO É OBRIGATÓRIO
})