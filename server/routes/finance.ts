import { Hono } from 'hono';
import { db } from '../db';
import { financials } from '../db/schema';
import { eq, desc } from 'drizzle-orm';
import { authMiddleware, requireMfa } from '../middleware/auth';
import { checkTenantAccess } from '../utils/tenant';

const app = new Hono<{ Variables: { organizationId: string; user: any } }>();
app.use('*', authMiddleware);
app.use('*', requireMfa);

app.get('/', async (c) => {
  const user = c.get('user');
  const organizationId = c.get('organizationId');

  checkTenantAccess(user, organizationId, 'list_financial');

  // Fetch transactions
  const transactions = await db.query.financials.findMany({
    where: eq(financials.organizationId, organizationId),
    orderBy: [desc(financials.dueDate)],
    limit: 50
  });

  return c.json({ ok: true, data: transactions });
});

export default app;