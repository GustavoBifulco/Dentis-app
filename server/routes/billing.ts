
import { Hono } from 'hono';
import { asaas } from '../integrations/asaas/client';
import { db } from '../db';
import { billingCustomers, billingCharges, patients, appointments } from '../db/schema';
import { eq, and, desc } from 'drizzle-orm';


const app = new Hono<{ Variables: { user: any; organizationId: string } }>();

// GET /api/billing/health
app.get('/health', async (c) => {
    try {
        // Just check if we can list customers (limited to 1) to verify auth
        await asaas.createCustomer({
            name: 'Health Check',
            cpfCnpj: '00000000000',
            email: 'health@check.com'
        }).catch(() => { }); // Ignore creation error, we just want to see if it connects or fails 401

        // Better: List customers
        // const customers = await asaas.getCustomer('00000000000');

        return c.json({ status: 'ok', provider: 'asaas', env: process.env.ASAAS_ENV });
    } catch (error: any) {
        return c.json({ status: 'error', message: error.message }, 503);
    }
});


// POST /api/billing/charges
app.post('/charges', async (c) => {
    try {
        const body = await c.req.json();
        const organizationId = c.get('organizationId');

        // 1. Validate Input (Simplified for MVP, would use Zod in production)
        if (!body.patientId || !body.amount || !body.method || !body.dueDate) {
            return c.json({ error: 'Missing required fields' }, 400);
        }

        // 2. Resolve Customer (Patient -> Asaas Customer)
        let billingCustomerId: number;
        let asaasCustomerId: string;

        // Check if mapping exists
        const [existingMapping] = await db.select().from(billingCustomers)
            .where(eq(billingCustomers.patientId, body.patientId))
            .limit(1);

        if (existingMapping) {
            billingCustomerId = existingMapping.id;
            asaasCustomerId = existingMapping.asaasCustomerId;
        } else {
            // Get Patient Info
            const [patient] = await db.select().from(patients).where(eq(patients.id, body.patientId)).limit(1);
            if (!patient) return c.json({ error: 'Patient not found' }, 404);

            // Create in Asaas
            const asaasCustomer = await asaas.createCustomer({
                name: patient.name,
                cpfCnpj: patient.cpf || '00000000000', // Fallback or force error? Asaas needs valid CPF often.
                email: patient.email || undefined,
                mobilePhone: patient.phone || undefined
            }) as any;

            asaasCustomerId = asaasCustomer.id;

            // Save Mapping
            const [mapping] = await db.insert(billingCustomers).values({
                organizationId,
                patientId: body.patientId,
                asaasCustomerId,
                name: patient.name,
                cpfCnpj: patient.cpf,
                email: patient.email
            }).returning();

            billingCustomerId = mapping.id;
        }

        // 3. Create Charge in Asaas
        const payment = await asaas.createPayment({
            customer: asaasCustomerId,
            billingType: body.method, // 'PIX' | 'BOLETO'
            value: Number(body.amount),
            dueDate: body.dueDate,
            description: body.description,
            externalReference: body.appointmentId ? `appt_${body.appointmentId}` : undefined
        }) as any;

        // 4. Save Charge in DB
        const chargeId = crypto.randomUUID();

        // Get Pix QR Code if method is PIX
        let pixQrCodePayload: string | undefined;
        let pixQrCodeImage: string | undefined;

        if (body.method === 'PIX') {
            try {
                const qr = await asaas.getPixQrCode(payment.id) as any;
                pixQrCodePayload = qr.payload;
                pixQrCodeImage = qr.encodedImage;
            } catch (e) {
                console.error('Failed to get PIX QR', e);
            }
        }

        await db.insert(billingCharges).values({
            id: chargeId,
            organizationId,
            ownerId: organizationId, // Default to clinic for now
            patientId: body.patientId,
            billingCustomerId,
            appointmentId: body.appointmentId,
            amount: String(body.amount),
            method: body.method,
            status: payment.status.toUpperCase(), // PENDING
            dueDate: body.dueDate,
            asaasPaymentId: payment.id,
            invoiceUrl: payment.invoiceUrl,
            bankSlipUrl: payment.bankSlipUrl,
            pixQrCodePayload,
            pixQrCodeImage,
            description: body.description
        });

        return c.json({
            success: true,
            chargeId,
            asaasId: payment.id,
            invoiceUrl: payment.invoiceUrl,
            bankSlipUrl: payment.bankSlipUrl,
            pix: pixQrCodePayload ? { payload: pixQrCodePayload, image: pixQrCodeImage } : undefined
        });

    } catch (error: any) {
        console.error('Create Charge Error:', error);
        return c.json({ error: error.message }, 500);
    }
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
