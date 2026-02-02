import { db } from './index';
import { clinics, clinicMembers, procedures, users } from './schema';
import { and, eq } from 'drizzle-orm';

const ADMIN_EMAIL = 'admin@dentis.app';
const ADMIN_CLERK_ID = 'seed_admin_master';

const seedProcedures = [
  {
    name: 'Profilaxia (Limpeza)',
    category: 'Preventivo',
    tussCode: '010101',
    price: '120.00',
    durationMinutes: 30,
    materialsCost: '20.00',
  },
  {
    name: 'Restauração Resina',
    category: 'Restaurador',
    tussCode: '020202',
    price: '250.00',
    durationMinutes: 45,
    materialsCost: '60.00',
  },
  {
    name: 'Exodontia Simples',
    category: 'Cirurgia',
    tussCode: '030303',
    price: '400.00',
    durationMinutes: 60,
    materialsCost: '80.00',
  },
];

async function ensureDefaultClinic() {
  let clinic = await db.query.clinics.findFirst();

  if (!clinic) {
    const [created] = await db.insert(clinics).values({
      name: 'Dentis Default Clinic',
    }).returning();
    clinic = created;
  }

  return clinic;
}

async function seedProceduresIfNeeded(clinicId: string) {
  const existing = await db.query.procedures.findMany({ limit: 1 });
  if (existing.length > 0) return;

  await db.insert(procedures).values(
    seedProcedures.map((proc) => ({
      ...proc,
      clinicId,
    }))
  );
}

async function ensureAdminUser(clinicId: string) {
  const existing = await db.query.users.findFirst({
    where: eq(users.email, ADMIN_EMAIL),
  });

  let adminUser = existing;

  if (!adminUser) {
    const [created] = await db.insert(users).values({
      clerkId: ADMIN_CLERK_ID,
      email: ADMIN_EMAIL,
      name: 'Admin',
      surname: 'Master',
      isActive: true,
    }).returning();
    adminUser = created;
  }

  if (!adminUser) return;

  const member = await db.query.clinicMembers.findFirst({
    where: and(eq(clinicMembers.userId, adminUser.id), eq(clinicMembers.clinicId, clinicId)),
  });

  if (!member) {
    await db.insert(clinicMembers).values({
      userId: adminUser.id,
      clinicId,
      role: 'OWNER',
    });
  }
}

async function main() {
  const clinic = await ensureDefaultClinic();
  await seedProceduresIfNeeded(clinic.id);
  await ensureAdminUser(clinic.id);

  console.log('Seed finalizado com sucesso.');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Erro ao executar seed:', error);
    process.exit(1);
  });
