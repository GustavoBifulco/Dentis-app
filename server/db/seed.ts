
import 'dotenv/config';
import { db } from './index';
import { users, patients, appointments, organizations, organizationMembers } from './schema';
import { eq } from 'drizzle-orm';

async function seed() {
  console.log('Iniciando seed...');

  // Cria dentista
  const [dentista] = await db.insert(users).values({
    clerkId: 'dentist_clerk_id_example',
    role: 'dentist',
    name: 'Dr. Gustavo Teste',
    email: 'dr@teste.com',
    cpf: '12345678901',
    phone: '(11) 90000-0000',
  }).returning();

  // Cria organização para o seed
  const [org] = await db.insert(organizations).values({
    id: 'org_seed_1',
    name: 'Clínica Seed',
  }).returning();

  // Adiciona dentista à organização
  await db.insert(organizationMembers).values({
    userId: dentista.id.toString(),
    organizationId: org.id,
    role: 'ADMIN'
  });

  const organizationId = 'org_seed_1';

  // Cria pacientes
  const [paciente1, paciente2] = await db.insert(patients).values([
    {
      organizationId: organizationId,
      name: 'Paciente Beta',
      cpf: '98765432100',
      phone: '(11) 99999-9999',
    },
    {
      organizationId: organizationId,
      name: 'Paciente Gama',
      cpf: '11122233344',
      phone: '(11) 98888-8888',
    },
  ]).returning();

  // Exemplo de agendamento
  const amanha = new Date(Date.now() + 24 * 60 * 60 * 1000);

  await db.insert(appointments).values({
    organizationId: organizationId,
    patientId: paciente1.id,
    dentistId: dentista.clerkId,
    scheduledDate: amanha.toISOString().split('T')[0], // YYYY-MM-DD
    scheduledTime: '14:00:00',
    status: 'pending',
    notes: 'Consulta de rotina',
  });

  console.log('Seed concluído com sucesso!');
  console.log('Dentista ID:', dentista.id);
  console.log('Paciente 1 ID:', paciente1.id);
}

seed().catch((err) => {
  console.error('Erro durante o seed:', err);
  process.exit(1);
});
