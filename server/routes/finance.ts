import { Hono } from 'hono';
import { db } from '../db';
import { verifyPatientAccess, generateRequestId } from '../utils/tenant';
import { financialLedger, accountsReceivable } from '../db/schema';
import { eq, and, desc, sql } from 'drizzle-orm';
import { logTimelineEvent } from '../services/timeline';
import { authMiddleware } from '../middleware/auth';

const app = new Hono<{ Variables: { user: any; auth: any; organizationId: string } }>();

app.use('*', authMiddleware);

// GET /api/finance/ledger
app.get('/ledger', async (c) => {
  const organizationId = c.get('organizationId');
  const items = await db.select().from(financialLedger)
    .where(eq(financialLedger.organizationId, organizationId))
    .orderBy(desc(financialLedger.transactionDate))
    .limit(100);
  return c.json(items);
});

// POST /api/finance/transaction (General Journal Entry)
app.post('/transaction', async (c) => {
  const organizationId = c.get('organizationId');
  const user = c.get('user');
  const body = await c.req.json();
  const requestId = crypto.randomUUID();

  if (body.patientId) {
    // IDOR Check
    await verifyPatientAccess(body.patientId, organizationId, requestId);
  }

  // 1. Calculate running balance? (Simplified: Just store amount for now, running balance requires locking or strictly ordered processing)
  // We'll skip balanceAfter logic for this MVP step to avoid race conditions without heavy locking.

  const [entry] = await db.insert(financialLedger).values({
    organizationId,
    transactionDate: new Date(body.date || Date.now()),
    amount: String(body.amount),
    type: body.type, // 'CREDIT' | 'DEBIT'
    category: body.category,
    description: body.description,
    refType: body.refType,
    refId: body.refId ? String(body.refId) : null,
    createdBy: String(user.id)
  }).returning();

  logTimelineEvent({
    organizationId,
    patientId: body.patientId, // Optional
    eventType: 'financial',
    refType: 'payment', // or generic
    refId: String(entry.id),
    title: `Financeiro: ${body.type === 'CREDIT' ? 'Entrada' : 'Saída'}`,
    summary: `${body.description} - R$ ${body.amount}`,
    createdBy: String(user.id)
  });

  return c.json(entry);
});

// GET /api/finance/receivables
app.get('/receivables', async (c) => {
  const organizationId = c.get('organizationId');
  const items = await db.select().from(accountsReceivable)
    .where(eq(accountsReceivable.organizationId, organizationId))
    .orderBy(desc(accountsReceivable.dueDate));
  return c.json(items);
});

export default app;