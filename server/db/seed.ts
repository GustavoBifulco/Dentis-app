import { db } from './index';
import { users, patients, appointments, clinicalRecords, financials, organizations, organizationMembers } from './schema';
import { eq } from 'drizzle-orm';

async function seed() {
  console.log('Iniciando seed...');

  // Limpeza opcional (cuidado em produção!)
  // await db.delete(financials);
  // await db.delete(clinicalRecords);
  // await db.delete(appointments);
  // await db.delete(patients);
  // await db.delete(users);

  // Cria dentista
  const [dentista] = await db.insert(users).values({
    clerkId: 'dentist_clerk_id_example',
    role: 'dentist',
    name: 'Dr. Gustavo Teste',
    email: 'dr@teste.com',
    cpf: '12345678901',
    profileData: { phone: '(11) 90000-0000' },
    onboardingComplete: new Date(),
  }).returning();

  // Cria organização para o seed
  const [org] = await db.insert(organizations).values({
    clerkOrgId: 'org_seed_1',
    name: 'Clínica Seed',
    slug: 'clinica-seed'
  }).returning();

  // Adiciona dentista à organização
  await db.insert(organizationMembers).values({
    userId: dentista.id,
    organizationId: org.id,
    role: 'ADMIN'
  });

  const organizationId = 'org_seed_1'; // Usaremos o clerkOrgId para manter compatibilidade com as queries baseadas em text


  // Cria pacientes
  const [paciente1, paciente2] = await db.insert(patients).values([
    {
      organizationId: organizationId,
      userId: 'patient_clerk_1',
      name: 'Paciente Beta',
      cpf: '98765432100',
      phone: '(11) 99999-9999',
    },
    {
      organizationId: organizationId,
      userId: 'patient_clerk_2',
      name: 'Paciente Gama',
      cpf: '11122233344',
      phone: '(11) 98888-8888',
    },
  ]).returning();

  // Exemplo de agendamento
  await db.insert(appointments).values({
    organizationId: organizationId,
    patientId: paciente1.id,
    dentistId: dentista.clerkId,
    startTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // amanhã
    status: 'scheduled',
    notes: 'Consulta de rotina',
  });

  // Exemplo de registro clínico
  await db.insert(clinicalRecords).values({
    organizationId: organizationId,
    patientId: paciente1.id,
    dentistId: dentista.clerkId,
    date: new Date(),
    treatment: 'Limpeza',
    notes: 'Paciente sem cáries',
  });

  // Exemplo de financeiro
  await db.insert(financials).values({
    organizationId: organizationId,
    patientId: paciente1.id,
    amount: 15000, // R$ 150,00 em centavos
    description: 'Consulta inicial',
    status: 'pending',
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });



  console.log('Seed concluído com sucesso!');
  console.log('Dentista ID:', dentista.id);
  console.log('Paciente 1 ID:', paciente1.id);
}

seed().catch((err) => {
  console.error('Erro durante o seed:', err);
  process.exit(1);
});
