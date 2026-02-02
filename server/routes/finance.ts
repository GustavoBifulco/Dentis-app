import { Hono } from 'hono';
import { db } from '../db';
import { financial } from '../db/schema';
import { eq, desc } from 'drizzle-orm';
import { authMiddleware } from '../middleware/auth';

const app = new Hono<{ Variables: { organizationId: number } }>();
app.use('*', authMiddleware);

app.get('/', async (c) => {
  const organizationId = c.get('organizationId');

  // Fetch transactions
  const transactions = await db.query.financial.findMany({
    where: eq(financial.organizationId, organizationId),
    orderBy: [desc(financial.dueDate)],
    limit: 50
  });

  return c.json({ ok: true, data: transactions });
});

export default app;