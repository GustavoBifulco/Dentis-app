import { Hono } from 'hono';
import { db } from '../db';
import { billingCustomers, billingCharges, patients, appointments } from '../db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { authMiddleware } from '../middleware/auth';

const app = new Hono<{ Variables: { user: any; auth: any; organizationId: string } }>();

app.use('*', authMiddleware);

// GET /api/billing/health
app.get('/health', async (c) => {
    return c.json({ status: 'ok', provider: 'stripe (marketplace migration in progress)' });
});


// POST /api/billing/charges
app.post('/charges', async (c) => {
    return c.json({
        error: 'Asaas integration removed. Stripe Marketplace implementation in progress. Please use the new Stripe Connect endpoints soon.'
    }, 501);
});



// GET /api/billing/charges
app.get('/charges', async (c) => {
    const organizationId = c.get('organizationId');
    const { patientId, status } = c.req.query();

    // Build conditions array
    const conditions = [eq(billingCharges.organizationId, organizationId)];

    if (patientId) {
        conditions.push(eq(billingCharges.patientId, Number(patientId)));
    }

    // Execute query
    const results = await db.select({
        id: billingCharges.id,
        amount: billingCharges.amount,
        dueDate: billingCharges.dueDate,
        status: billingCharges.status,
        method: billingCharges.method,
        patientName: patients.name,
        asaasId: billingCharges.asaasPaymentId,
        invoiceUrl: billingCharges.invoiceUrl,
        appointmentId: billingCharges.appointmentId
    })
        .from(billingCharges)
        .leftJoin(patients, eq(billingCharges.patientId, patients.id))
        .where(and(...conditions))
        .orderBy(desc(billingCharges.createdAt))
        .limit(50);

    return c.json(results);
});



export default app;
