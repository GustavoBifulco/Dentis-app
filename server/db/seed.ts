import 'dotenv/config';
import { db } from './index';
import { users, patients, appointments, organizations, organizationMembers } from './schema';
import { eq, and } from 'drizzle-orm';

async function seed() {
  console.log('Iniciando seed...');

  const dentistClerkId = 'dentist_clerk_id_example';
  let dentista;
  
  const existingUser = await db.select().from(users).where(eq(users.clerkId, dentistClerkId)).limit(1);
  if (existingUser.length > 0) {
    dentista = existingUser[0];
    console.log(`Dentista já existe: ${dentista.name}`);
  } else {
    [dentista] = await db.insert(users).values({
      clerkId: dentistClerkId,
      role: 'dentist',
      name: 'Dr. Gustavo Teste',
      email: 'dr@teste.com',
      cpf: '12345678901',
      phone: '(11) 90000-0000',
    }).returning();
    console.log(`Dentista criado: ${dentista.name}`);
  }

  const orgId = 'org_seed_1';
  let org;

  const existingOrg = await db.select().from(organizations).where(eq(organizations.id, orgId)).limit(1);
  if (existingOrg.length > 0) {
    org = existingOrg[0];
    console.log(`Organização já existe: ${org.name}`);
  } else {
    [org] = await db.insert(organizations).values({
      id: orgId,
      name: 'Clínica Seed',
    }).returning();
    console.log(`Organização criada: ${org.name}`);
  }

  const targetUserId = dentista.id.toString();
  const existingMembers = await db.select().from(organizationMembers).where(
      and(eq(organizationMembers.userId, targetUserId), eq(organizationMembers.organizationId, orgId))
  );

  if (existingMembers.length === 0) {
      await db.insert(organizationMembers).values({ userId: targetUserId, organizationId: orgId, role: 'ADMIN' });
      console.log('Dentista adicionado à organização.');
  }

  // Pacientes e Agendamentos
  const patientsToCreate = [
    { organizationId: orgId, name: 'Paciente Beta', cpf: '98765432100', phone: '(11) 99999-9999' },
    { organizationId: orgId, name: 'Paciente Gama', cpf: '11122233344', phone: '(11) 98888-8888' },
  ];

  let createdPatients = [];
  for (const p of patientsToCreate) {
      const found = await db.select().from(patients).where(and(eq(patients.cpf, p.cpf), eq(patients.organizationId, orgId))).limit(1);
      if (found.length > 0) createdPatients.push(found[0]);
      else {
          const [newP] = await db.insert(patients).values(p).returning();
          createdPatients.push(newP);
      }
  }

  if (createdPatients.length > 0) {
      const p1 = createdPatients[0];
      const today = new Date().toISOString().split('T')[0];
      const existingAppt = await db.select().from(appointments).where(
          and(eq(appointments.organizationId, orgId), eq(appointments.patientId, p1.id), eq(appointments.scheduledDate, today))
      ).limit(1);
      
      if (existingAppt.length === 0) {
          await db.insert(appointments).values({
            organizationId: orgId,
            patientId: p1.id,
            dentistId: dentistClerkId,
            scheduledDate: today,
            scheduledTime: '14:00:00',
            status: 'pending',
            notes: 'Consulta de rotina seed',
            duration: 60
          });
          console.log('Agendamento criado.');
      }
  }
  console.log('Seed concluído!');
}

seed().catch((err) => { console.error('Erro:', err); process.exit(1); });
