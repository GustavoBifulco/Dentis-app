import { Hono } from 'hono';
import { db } from '../db';
import { verifyPatientAccess, generateRequestId } from '../utils/tenant';
import { financials } from '../db/schema';
import { eq, and, desc, sql } from 'drizzle-orm';
import { logTimelineEvent } from '../services/timeline';
import { authMiddleware } from '../middleware/auth';

const app = new Hono<{ Variables: { user: any; auth: any; organizationId: string } }>();

app.use('*', authMiddleware);

// GET /api/finance/ledger
app.get('/ledger', async (c) => {
  const organizationId = c.get('organizationId');
  const items = await db.select().from(financials)
    .where(eq(financials.organizationId, organizationId))
    .orderBy(desc(financials.date))
    .limit(100);
  return c.json(items);
});

// POST /api/finance/transaction (General Journal Entry)
app.post('/transaction', async (c) => {
  const organizationId = c.get('organizationId');
  const user = c.get('user');
  const body = await c.req.json();
  const requestId = generateRequestId();

  if (body.patientId) {
    // IDOR Check
    await verifyPatientAccess(body.patientId, organizationId, requestId);
  }

  const [entry] = await db.insert(financials).values({
    organizationId,
    date: body.date || new Date().toISOString().split('T')[0],
    amount: String(body.amount),
    type: body.type, // 'income' | 'expense'
    category: body.category,
    description: body.description,
    patientId: body.patientId ? Number(body.patientId) : null,
    createdBy: String(user.id)
  }).returning();

  logTimelineEvent({
    organizationId,
    patientId: body.patientId,
    eventType: 'financial',
    refType: 'payment',
    refId: String(entry.id),
    title: `Financeiro: ${body.type === 'income' ? 'Entrada' : 'Saída'}`,
    summary: `${body.description} - R$ ${body.amount}`,
    createdBy: String(user.id)
  });

  return c.json(entry);
});

// GET /api/finance/receivables (Unified financials view)
app.get('/receivables', async (c) => {
  const organizationId = c.get('organizationId');
  const items = await db.select().from(financials)
    .where(and(
      eq(financials.organizationId, organizationId),
      eq(financials.status, 'pending')
    ))
    .orderBy(desc(financials.date));
  return c.json(items);
});

export default app;