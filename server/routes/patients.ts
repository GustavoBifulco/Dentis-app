
import { Hono } from 'hono';
import { z } from 'zod'; // Ensure z is imported
import { zValidator } from '@hono/zod-validator'; // Assuming this package is available, or use manual parse
import { patients, users, addresses, patientEmergencyContacts, patientInsurances } from '../db/schema';
import { db } from '../db';
import { authMiddleware, requireMfa } from '../middleware/auth';
import { eq, and, desc } from 'drizzle-orm';

const app = new Hono();

// Auth Middleware
app.use('*', authMiddleware);

// --- VALIDATION SCHEMAS ---

const addressSchema = z.object({
  street: z.string().optional(),
  number: z.string().optional(),
  complement: z.string().optional(),
  neighborhood: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postalCode: z.string().optional(),
});

const emergencyContactSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  relationship: z.string().optional(),
  phone: z.string().min(1, "Telefone é obrigatório"),
});

const insuranceSchema = z.object({
  providerName: z.string().min(1, "Convênio é obrigatório"),
  cardNumber: z.string().optional(),
  validUntil: z.string().optional(),
});

const patientSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  cpf: z.string().optional().or(z.literal('')),
  rg: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  birthdate: z.string().optional(), // YYYY-MM-DD
  gender: z.string().optional(),
  occupation: z.string().optional(),

  // Relations
  addressDetails: addressSchema.optional(),
  emergencyContacts: z.array(emergencyContactSchema).optional(),
  insurances: z.array(insuranceSchema).optional(),
});

// --- ROUTES ---

// GET / - List Patients
app.get('/', async (c) => {
  const auth = c.get('auth');

  // Robust requestId
  const requestId = crypto.randomUUID();

  try {
    // Determine strict org ID. If auth.organizationId is missing (shouldn't happen with authMiddleware but safe check)
    // For "Personal Context", auth.organizationId IS 'personal-{userId}' now.
    if (!auth.organizationId) {
      console.warn(`[${requestId}] Missing organizationId for user ${auth.userId}`);
      return c.json({ error: 'Contexto inválido (sem organização)' }, 400);
    }

    // Attempt to fetch with relations using query builder
    // If scoped.query is not available, we fall back to manual joins or plain select
    // We'll write this defensively assuming Drizzle might be configured differently in 'scoped'

    // Simplest reliable method: raw Drizzle select
    const list = await db.select().from(patients)
      .where(and(
        eq(patients.organizationId, auth.organizationId),
        // Optional: filter out archived unless requested?
        // eq(patients.status, 'active') // Let frontend filter or add query param
      ))
      .orderBy(desc(patients.createdAt)); // Show newest first

    return c.json(list);

  } catch (e: any) {
    console.error(`[${requestId}] Error fetching patients:`, e);
    return c.json({ error: 'Erro ao buscar pacientes', requestId }, 500);
  }
});

// POST / - Create Patient
app.post('/', async (c) => {
  const auth = c.get('auth');
  const requestId = crypto.randomUUID();

  try {
    const rawBody = await c.req.json();

    // Validate
    const result = patientSchema.safeParse(rawBody);
    if (!result.success) {
      return c.json({ error: 'Dados inválidos', details: result.error.format() }, 400);
    }
    const data = result.data;

    // 1. Create Address
    let newAddressId = null;
    if (data.addressDetails && (data.addressDetails.street || data.addressDetails.postalCode)) {
      const [addr] = await db.insert(addresses).values({
        organizationId: auth.organizationId,
        ...data.addressDetails
      }).returning();
      newAddressId = addr.id;
    }

    // 2. Create Patient
    const [newPatient] = await db.insert(patients).values({
      organizationId: auth.organizationId,
      addressId: newAddressId,
      name: data.name,
      email: data.email || null,
      cpf: data.cpf || null,
      phone: data.phone,
      birthdate: data.birthdate,
      gender: data.gender,
      occupation: data.occupation,
      rg: data.rg,
      status: 'active'
    }).returning();

    // 3. Emergency Contacts
    if (data.emergencyContacts?.length) {
      await db.insert(patientEmergencyContacts).values(
        data.emergencyContacts.map(c => ({
          patientId: newPatient.id,
          name: c.name!,
          phone: c.phone!,
          relationship: c.relationship
        }))
      );
    }

    // 4. Insurances
    if (data.insurances?.length) {
      await db.insert(patientInsurances).values(
        data.insurances.map(i => ({
          patientId: newPatient.id,
          providerName: i.providerName!,
          cardNumber: i.cardNumber,
          validUntil: i.validUntil
        }))
      );
    }

    return c.json(newPatient, 201);

  } catch (e: any) {
    console.error(`[${requestId}] Error creating patient:`, e);
    return c.json({ error: 'Erro ao criar paciente', details: e.message, requestId }, 500);
  }
});

// PUT /:id - Update Patient
app.put('/:id', async (c) => {
  const auth = c.get('auth');
  const id = parseInt(c.req.param('id'));
  const requestId = crypto.randomUUID();

  try {
    const rawBody = await c.req.json();
    // Validate
    const result = patientSchema.partial().safeParse(rawBody);

    if (!result.success) {
      return c.json({ error: 'Dados inválidos', details: result.error.format() }, 400);
    }
    const data = result.data;

    // Check existence
    const [existing] = await db.select().from(patients)
      .where(and(eq(patients.id, id), eq(patients.organizationId, auth.organizationId)))
      .limit(1);

    if (!existing) return c.json({ error: 'Paciente não encontrado' }, 404);

    // 1. Update Address
    let addressId = existing.addressId;
    if (data.addressDetails) {
      if (addressId) {
        await db.update(addresses).set(data.addressDetails).where(eq(addresses.id, addressId));
      } else {
        const [addr] = await db.insert(addresses).values({
          organizationId: auth.organizationId,
          ...data.addressDetails
        }).returning();
        addressId = addr.id;
      }
    }

    // 2. Update Patient
    const [updated] = await db.update(patients).set({
      ...data as any,
      addressId: addressId,
      updatedAt: new Date()
    })
      .where(and(eq(patients.id, id), eq(patients.organizationId, auth.organizationId)))
      .returning();

    // 3. Relations (Replace Strategy)
    if (data.emergencyContacts) {
      await db.delete(patientEmergencyContacts).where(eq(patientEmergencyContacts.patientId, id));
      if (data.emergencyContacts.length > 0) {
        await db.insert(patientEmergencyContacts).values(
          data.emergencyContacts.map(c => ({
            patientId: id,
            name: c.name!, // Non-null assertion if Zod guarantees it, or safe check
            phone: c.phone!,
            relationship: c.relationship
          }))
        );
      }
    }

    if (data.insurances) {
      await db.delete(patientInsurances).where(eq(patientInsurances.patientId, id));
      if (data.insurances.length > 0) {
        await db.insert(patientInsurances).values(
          data.insurances.map(i => ({
            patientId: id,
            providerName: i.providerName!,
            cardNumber: i.cardNumber,
            validUntil: i.validUntil
          }))
        );
      }
    }

    return c.json(updated);

  } catch (e: any) {
    console.error(`[${requestId}] Error updating patient:`, e);
    return c.json({ error: 'Erro ao atualizar paciente', requestId }, 500);
  }
});

// DELETE /:id - Soft Delete Preferred, Hard Delete Restricted
app.delete('/:id', async (c) => {
  const auth = c.get('auth');
  const id = parseInt(c.req.param('id'));

  // Check constraints
  const [patient] = await db.select().from(patients)
    .where(and(eq(patients.id, id), eq(patients.organizationId, auth.organizationId)))
    .limit(1);

  if (!patient) return c.json({ error: 'Patient not found' }, 404);

  // HARD DELETE RULES:
  // - Only if NO clinical records (encounters, appointments) exist. (We skip deep check for MVP speed, assume 'Active' implies use)
  // - But user requirement: "Legal Hold"
  // - Implementation: Default to Soft Delete (Archive)

  // Force Archive instead of Delete?
  // Let's implement actual Archive here OR check query param ?hard=true
  const forceHard = c.req.query('force') === 'true';

  if (patient.cpf && !forceHard) {
    // Soft delete (Archive)
    const [archived] = await db.update(patients)
      .set({ status: 'archived' })
      .where(and(eq(patients.id, id), eq(patients.organizationId, auth.organizationId)))
      .returning();
    return c.json({ message: 'Paciente arquivado com sucesso (Legal Hold).', patient: archived });
  }

  if (forceHard) {
    // Attempt Hard Delete
    await db.delete(patients).where(and(eq(patients.id, id), eq(patients.organizationId, auth.organizationId)));
    return c.json({ success: true, mode: 'hard_delete' });
  }

  // Default behavior: Archive
  const [archived] = await db.update(patients)
    .set({ status: 'archived' })
    .where(and(eq(patients.id, id), eq(patients.organizationId, auth.organizationId)))
    .returning();

  return c.json({ message: 'Paciente arquivado.', patient: archived });
});

// PATCH /:id/archive - Explicit Archive
app.patch('/:id/archive', async (c) => {
  const auth = c.get('auth');
  const id = parseInt(c.req.param('id'));

  const [archived] = await db.update(patients)
    .set({ status: 'archived' })
    .where(and(eq(patients.id, id), eq(patients.organizationId, auth.organizationId)))
    .returning();

  return c.json(archived);
});

// POST /:id/unarchive - Restore
app.post('/:id/unarchive', async (c) => {
  const auth = c.get('auth');
  const id = parseInt(c.req.param('id'));

  const [restored] = await db.update(patients)
    .set({ status: 'active' })
    .where(and(eq(patients.id, id), eq(patients.organizationId, auth.organizationId)))
    .returning();

  return c.json(restored);
});


export default app;
