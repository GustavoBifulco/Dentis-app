
import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { db } from '../db';
import { clinicalRecords } from '../db/schema';
import { eq, desc, and } from 'drizzle-orm';
import { authMiddleware, requireMfa } from '../middleware/auth';
import { checkTenantAccess } from '../utils/tenant';
import { logAudit } from '../services/audit';
import { signDocument } from '../services/signature';

const app = new Hono<{ Variables: { user: any; organizationId: string; userId: string } }>();

app.use('*', authMiddleware);
app.use('*', requireMfa);

const recordSchema = z.object({
  patientId: z.coerce.number(),
  type: z.enum(['ODONTOGRAM_STATE', 'EVOLUTION', 'PRESCRIPTION']),
  data: z.any(), // JSON estruturado
});

// GET /api/clinical/:patientId/odontogram
app.get('/:patientId/odontogram', async (c) => {
  const patientId = Number(c.req.param('patientId'));
  const user = c.get('user');
  const organizationId = c.get('organizationId');

  checkTenantAccess(user, organizationId, 'view_clinical_record');

  // LOG AUDIT
  logAudit({
    userId: user.id,
    action: 'VIEW_ODONTOGRAM',
    resourceType: 'clinical_record',
    resourceId: patientId,
    tenantId: organizationId,
    ip: c.req.header('x-forwarded-for') || 'unknown',
    details: { patientId }
  });

  const lastState = await db.query.clinicalRecords.findFirst({
    where: and(
      eq(clinicalRecords.patientId, patientId),
      eq(clinicalRecords.organizationId, organizationId),
      eq(clinicalRecords.type, 'ODONTOGRAM_STATE')
    ),
    orderBy: [desc(clinicalRecords.createdAt)]
  });

  return c.json({ ok: true, data: lastState?.description ? JSON.parse(lastState.description) : null });
});

// POST /api/clinical
app.post('/', zValidator('json', recordSchema.extend({ signatureToken: z.string().optional() })), async (c) => {
  const user = c.get('user');
  const organizationId = c.get('organizationId');
  const dentistId = c.get('userId');

  checkTenantAccess(user, organizationId, 'create_clinical_record');

  // Destructure with potential extra fields
  const body = c.req.valid('json');
  const { patientId, type, data } = body;
  const signatureToken = (body as any).signatureToken; // Extract if exists

  let finalData = data;
  let isSigned = false;

  // DIGITAL SIGNATURE LOGIC (ICP-Brasil Stub)
  if (type === 'PRESCRIPTION' && signatureToken) {
    try {
      // In real scenario, we'd hash the 'data' content here
      const signatureMeta = await signDocument(data, signatureToken, user);

      finalData = {
        ...data,
        digitalSignature: signatureMeta
      };
      isSigned = true;

      console.log(`[SIG] Prescription for Patient ${patientId} signed by ${user.name}`);
    } catch (err: any) {
      return c.json({ ok: false, error: `Signature Failed: ${err.message}` }, 400);
    }
  }

  const [newRecord] = await db.insert(clinicalRecords).values({
    organizationId,
    patientId,
    dentistId: String(dentistId),
    type: isSigned ? 'PRESCRIPTION_SIGNED' : type,
    description: JSON.stringify(finalData),
  }).returning();

  return c.json({ ok: true, data: newRecord }, 201);
});

export default app;
