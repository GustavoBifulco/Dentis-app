import { Hono } from 'hono';
import { patients, users } from '../db/schema';
import { scopedDb } from '../db/scoped';
import { authMiddleware, requireMfa } from '../middleware/auth';
import { seedDefaultData } from '../services/seedData';
import { eq, and } from 'drizzle-orm';

const app = new Hono();

// Auth deve vir PRIMEIRO para popular user/auth
app.use('*', authMiddleware);
// MFA vem depois (opcional, se ativado)
app.use('*', requireMfa);

// ... imports
import { patients, users, addresses, patientEmergencyContacts, patientInsurances } from '../db/schema';
// ...

app.get('/', async (c) => {
  const auth = c.get('auth');
  if (!['dentist', 'clinic_owner'].includes(auth.role)) return c.json({ error: 'Acesso negado' }, 403);

  const scoped = scopedDb(c);
  // Using query builder for relations if available, or just simple select if relations not setup in Drizzle instance config
  // Assuming standard drizzle query is available on 'scoped' if it's a drizzle instance

  // NOTE: 'scoped' seems to be a custom wrapper or just db instance. 
  // If it supports .query.patients.findMany usage:
  try {
    const list = await scoped.query.patients.findMany({
      where: eq(patients.organizationId, auth.organizationId),
      with: {
        address: true,
        emergencyContacts: true,
        insurances: true
      }
    });
    return c.json(list);
  } catch (e) {
    // Fallback if .query not available or fails, use basic select (won't have relations)
    console.log("Relations fetch failed, falling back to flat select", e);
    const list = await scoped.select().from(patients).where(eq(patients.organizationId, auth.organizationId));
    return c.json(list);
  }
});

app.post('/', async (c) => {
  const auth = c.get('auth');
  if (!['dentist', 'clinic_owner'].includes(auth.role)) return c.json({ error: 'Acesso negado' }, 403);

  const body = await c.req.json();
  const scoped = scopedDb(c);

  const {
    addressDetails,
    emergencyContacts,
    insurances,
    ...patientData
  } = body;

  // 1. Create Address if provided
  let newAddressId = null;
  if (addressDetails && (addressDetails.street || addressDetails.zipCode)) {
    const [addr] = await scoped.insert(addresses).values({
      organizationId: auth.organizationId,
      ...addressDetails
    }).returning();
    newAddressId = addr.id;
  }

  // 2. Create Patient
  const [newPatient] = await scoped.insert(patients).values({
    ...patientData,
    addressId: newAddressId,
    organizationId: auth.organizationId,
  }).returning();

  // 3. Create Emergency Contacts
  if (emergencyContacts && emergencyContacts.length > 0) {
    await scoped.insert(patientEmergencyContacts).values(
      emergencyContacts.map((c: any) => ({
        patientId: newPatient.id,
        ...c
      }))
    );
  }

  // 4. Create Insurances
  if (insurances && insurances.length > 0) {
    await scoped.insert(patientInsurances).values(
      insurances.map((i: any) => ({
        patientId: newPatient.id,
        ...i
      }))
    );
  }

  return c.json(newPatient, 201);
});

app.put('/:id', async (c) => {
  const auth = c.get('auth');
  if (!['dentist', 'clinic_owner'].includes(auth.role)) return c.json({ error: 'Acesso negado' }, 403);

  const id = parseInt(c.req.param('id'));
  const body = await c.req.json();
  const scoped = scopedDb(c);

  const {
    addressDetails,
    emergencyContacts,
    insurances,
    cpf, // Extract to prevent accidental overwrite if strictly guarded? (Keeping simplified)
    ...updates
  } = body;

  const [existing] = await scoped.select().from(patients).where(and(eq(patients.id, id), eq(patients.organizationId, auth.organizationId))).limit(1);
  if (!existing) return c.json({ error: 'Patient not found' }, 404);

  // 1. Handle Address
  let addressId = existing.addressId;
  if (addressDetails) {
    if (addressId) {
      // Update existing
      await scoped.update(addresses)
        .set(addressDetails)
        .where(eq(addresses.id, addressId));
    } else if (addressDetails.street) {
      // Create new
      const [addr] = await scoped.insert(addresses).values({
        organizationId: auth.organizationId,
        ...addressDetails
      }).returning();
      addressId = addr.id;
    }
  }

  // 2. Update Patient
  const [updatedPatient] = await scoped
    .update(patients)
    .set({
      ...updates,
      cpf, // Allow update
      addressId,
      organizationId: auth.organizationId,
    })
    .where(and(eq(patients.id, id), eq(patients.organizationId, auth.organizationId)))
    .returning();

  // 3. Handle Relation Replacements (Naive strategy: Delete all and Insert new)
  // Making this safer: only if array is provided
  if (emergencyContacts) {
    await scoped.delete(patientEmergencyContacts).where(eq(patientEmergencyContacts.patientId, id));
    if (emergencyContacts.length > 0) {
      await scoped.insert(patientEmergencyContacts).values(
        emergencyContacts.map((c: any) => ({ patientId: id, ...c }))
      );
    }
  }

  if (insurances) {
    await scoped.delete(patientInsurances).where(eq(patientInsurances.patientId, id));
    if (insurances.length > 0) {
      await scoped.insert(patientInsurances).values(
        insurances.map((i: any) => ({ patientId: id, ...i }))
      );
    }
  }

  return c.json(updatedPatient);
});

// Archive Patient (Soft Delete)
// ... (keep existing archive/delete routes)

// Archive Patient (Soft Delete for compliance)
app.patch('/:id/archive', async (c) => {
  const auth = c.get('auth');
  if (!['dentist', 'clinic_owner'].includes(auth.role)) return c.json({ error: 'Acesso negado' }, 403);

  const id = parseInt(c.req.param('id'));
  const scoped = scopedDb(c);

  const [archivedPatient] = await scoped
    .update(patients)
    .set({ status: 'archived' })
    .where(and(eq(patients.id, id), eq(patients.organizationId, auth.organizationId)))
    .returning();

  return c.json(archivedPatient);
});

// Delete Patient (Hard Delete)
app.delete('/:id', async (c) => {
  const auth = c.get('auth');
  if (!['dentist', 'clinic_owner'].includes(auth.role)) return c.json({ error: 'Acesso negado' }, 403);

  const id = parseInt(c.req.param('id'));
  const scoped = scopedDb(c);

  // 1. Fetch Patient Details
  const [patient] = await scoped.select().from(patients)
    .where(and(eq(patients.id, id), eq(patients.organizationId, auth.organizationId)))
    .limit(1);

  if (!patient) return c.json({ error: 'Patient not found' }, 404);

  // 2. Check for "Legal Hold" conditions (CPF or Clinical Data)
  // We check basic fields here. ideally we check linked tables too but let's start with CPF and explicit archival requirement.
  if (patient.cpf) {
    return c.json({
      error: 'LEGAL_HOLD_REQUIRED',
      message: 'Pacientes com CPF registrado devem ser arquivados por 20 anos (Lei 13.787/2018).',
      requiresArchive: true
    }, 400);
  }

  // 3. Perform Hard Delete if safe
  await scoped.delete(patients)
    .where(and(eq(patients.id, id), eq(patients.organizationId, auth.organizationId)));

  return c.json({ success: true });
});

export default app;
