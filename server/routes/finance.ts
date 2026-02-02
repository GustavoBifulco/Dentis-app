import { Hono } from 'hono';
import { db } from '../db';
import { financial } from '../db/schema';
import { eq, desc } from 'drizzle-orm';
import { authMiddleware } from '../middleware/auth';

const app = new Hono<{ Variables: { clinicId: number } }>();
app.use('*', authMiddleware);

app.get('/', async (c) => {
  const clinicId = c.get('clinicId');

  // Fetch transactions
  const transactions = await db.query.financial.findMany({
    where: eq(financial.clinicId, clinicId),
    orderBy: [desc(financial.dueDate)],
    limit: 50
  });

  return c.json({ ok: true, data: transactions });
});

export default app;