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

async function ensureDefaultClinic(): Promise<{ id: number }> {
  let clinic = await db.query.clinics.findFirst();

  if (!clinic) {
    const [created] = await db.insert(clinics).values({
      name: 'Dentis Default Clinic',
    }).returning();
    clinic = created as any;
  }

  return clinic as any;
}

async function ensureAdminUser(clinicId: number): Promise<{ id: number } | undefined> {
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
      role: 'OWNER',
      isActive: true,
      onboardingComplete: true,
    }).returning();
    adminUser = created;
  }

  if (!adminUser) return undefined;

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

  return adminUser;
}

async function seedProceduresIfNeeded(clinicId: number, userId: number) {
  const existing = await db.query.procedures.findMany({ limit: 1 });
  if (existing.length > 0) return;

  await db.insert(procedures).values(
    seedProcedures.map((proc) => ({
      clinicId,
      userId,
      name: proc.name,
      category: proc.category,
      tussCode: proc.tussCode,
      price: proc.price,
      cost: proc.materialsCost,
      duration: proc.durationMinutes,
      code: proc.tussCode, // Fallback
    }))
  );
}

async function main() {
  const clinic = await ensureDefaultClinic();
  if (!clinic) throw new Error("Falha ao criar clínica default");

  const admin = await ensureAdminUser(clinic.id);

  if (admin) {
    await seedProceduresIfNeeded(clinic.id, admin.id);
  }

  console.log('Seed finalizado com sucesso.');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Erro ao executar seed:', error);
    process.exit(1);
  });
