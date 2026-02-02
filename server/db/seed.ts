import 'dotenv/config';
import { webcrypto } from 'node:crypto';
if (typeof globalThis.crypto === 'undefined') {
  Object.defineProperty(globalThis, 'crypto', { value: webcrypto, writable: false, configurable: true });
}

import { db } from './index';
import {
  users,
  professionalProfiles,
  courierProfiles,
  organizations,
  organizationMembers,
  patients,
  orders,
  procedures,
  products
} from './schema';
import { clerkClient } from '@clerk/clerk-sdk-node';

/**
 * Seed Script - 4 Usuários Distintos para Teste Real do Marketplace
 * 
 * 1. dentista@dentis.app - Dentista da Clínica Sorriso
 * 2. lab@dentis.app - Admin do Lab Dental Art
 * 3. motoboy@dentis.app - Courier
 * 4. dental@dentis.app - Fornecedor de Insumos (Dental Speed)
 */

async function seed() {
  console.log('🌱 Iniciando seed do banco de dados...\n');

  try {
    // ========================================
    // 1. CRIAR USUÁRIOS NO CLERK
    // ========================================
    console.log('👤 Criando usuários no Clerk...');

    const dentistaClerk = await clerkClient.users.createUser({
      emailAddress: ['dentista@dentis.app'],
      password: 'DentisTest2024!@#',
      firstName: 'Dr. Carlos',
      lastName: 'Silva',
      publicMetadata: {
        onboardingComplete: true,
        role: 'dentist'
      }
    });

    const labClerk = await clerkClient.users.createUser({
      emailAddress: ['lab@dentis.app'],
      password: 'DentisTest2024!@#',
      firstName: 'Lab',
      lastName: 'Dental Art',
      publicMetadata: {
        onboardingComplete: true,
        role: 'lab_admin'
      }
    });

    const motoboyClerk = await clerkClient.users.createUser({
      emailAddress: ['motoboy@dentis.app'],
      password: 'DentisTest2024!@#',
      firstName: 'João',
      lastName: 'Motoboy',
      publicMetadata: {
        onboardingComplete: true,
        role: 'courier'
      }
    });

    const dentalClerk = await clerkClient.users.createUser({
      emailAddress: ['dental@dentis.app'],
      password: 'DentisTest2024!@#',
      firstName: 'Dental Speed',
      lastName: 'Fornecedor',
      publicMetadata: {
        onboardingComplete: true,
        role: 'supplier'
      }
    });

    console.log('✅ Usuários criados no Clerk\n');

    // ========================================
    // 2. CRIAR ORGANIZAÇÕES NO CLERK
    // ========================================
    console.log('🏢 Criando organizações no Clerk...');

    const clinicaOrg = await clerkClient.organizations.createOrganization({
      name: 'Clínica Sorriso',
      createdBy: dentistaClerk.id,
    });

    const labOrg = await clerkClient.organizations.createOrganization({
      name: 'Lab Dental Art',
      createdBy: labClerk.id,
    });

    const dentalOrg = await clerkClient.organizations.createOrganization({
      name: 'Dental Speed',
      createdBy: dentalClerk.id,
    });

    console.log('✅ Organizações criadas no Clerk\n');

    // ========================================
    // 3. CRIAR USUÁRIOS NO BANCO
    // ========================================
    console.log('💾 Criando usuários no banco de dados...');

    const [dentista] = await db.insert(users).values({
      clerkId: dentistaClerk.id,
      email: 'dentista@dentis.app',
      cpf: '111.111.111-11',
      name: 'Dr. Carlos',
      surname: 'Silva',
      isActive: true,
      onboardingComplete: true,
    }).returning();

    const [labUser] = await db.insert(users).values({
      clerkId: labClerk.id,
      email: 'lab@dentis.app',
      cpf: '222.222.222-22',
      name: 'Lab',
      surname: 'Dental Art',
      isActive: true,
      onboardingComplete: true,
    }).returning();

    const [motoboy] = await db.insert(users).values({
      clerkId: motoboyClerk.id,
      email: 'motoboy@dentis.app',
      cpf: '333.333.333-33',
      name: 'João',
      surname: 'Motoboy',
      isActive: true,
      onboardingComplete: true,
    }).returning();

    const [dentalUser] = await db.insert(users).values({
      clerkId: dentalClerk.id,
      email: 'dental@dentis.app',
      cpf: '444.444.444-44',
      name: 'Dental Speed',
      surname: 'Fornecedor',
      isActive: true,
      onboardingComplete: true,
    }).returning();

    console.log('✅ Usuários criados no banco\n');

    // ========================================
    // 4. CRIAR PERFIS
    // ========================================
    console.log('🎭 Criando perfis...');

    // Dentista - Professional Profile
    await db.insert(professionalProfiles).values({
      userId: dentista.id,
      cro: 'CRO-SP 12345',
      specialty: 'Ortodontia',
      type: 'DENTIST',
    });

    // Motoboy - Courier Profile
    await db.insert(courierProfiles).values({
      userId: motoboy.id,
      vehicle: 'MOTO',
      licensePlate: 'ABC-1234',
      isOnline: true,
      latitude: '-23.5505',
      longitude: '-46.6333',
    });

    console.log('✅ Perfis criados\n');

    // ========================================
    // 5. CRIAR ORGANIZAÇÕES NO BANCO
    // ========================================
    console.log('🏥 Criando organizações no banco...');

    const [clinica] = await db.insert(organizations).values({
      clerkOrgId: clinicaOrg.id,
      name: 'Clínica Sorriso',
      type: 'CLINIC',
      status: 'ACTIVE',
      cnpj: '11.111.111/0001-11',
      phone: '(11) 98888-8888',
      address: 'Av. Paulista, 1000 - São Paulo, SP',
      latitude: '-23.5615',
      longitude: '-46.6562',
    }).returning();

    const [lab] = await db.insert(organizations).values({
      clerkOrgId: labOrg.id,
      name: 'Lab Dental Art',
      type: 'LAB',
      status: 'ACTIVE',
      cnpj: '22.222.222/0001-22',
      phone: '(11) 97777-7777',
      address: 'Rua Augusta, 500 - São Paulo, SP',
      latitude: '-23.5505',
      longitude: '-46.6333',
    }).returning();

    const [dental] = await db.insert(organizations).values({
      clerkOrgId: dentalOrg.id,
      name: 'Dental Speed',
      type: 'SUPPLIER',
      status: 'ACTIVE',
      cnpj: '33.333.333/0001-33',
      phone: '(11) 96666-6666',
      address: 'Av. Brigadeiro Faria Lima, 2000 - São Paulo, SP',
      latitude: '-23.5745',
      longitude: '-46.6889',
    }).returning();

    console.log('✅ Organizações criadas no banco\n');

    // ========================================
    // 6. CRIAR MEMBERSHIPS
    // ========================================
    console.log('👥 Criando memberships...');

    await db.insert(organizationMembers).values([
      {
        userId: dentista.id,
        organizationId: clinica.id,
        role: 'admin',
      },
      {
        userId: labUser.id,
        organizationId: lab.id,
        role: 'admin',
      },
      {
        userId: dentalUser.id,
        organizationId: dental.id,
        role: 'admin',
      }
    ]);

    console.log('✅ Memberships criados\n');

    // ========================================
    // 7. CRIAR PACIENTES
    // ========================================
    console.log('🦷 Criando pacientes...');

    const [paciente1] = await db.insert(patients).values({
      organizationId: clinica.id,
      name: 'Maria Santos',
      cpf: '555.555.555-55',
      phone: '(11) 96666-6666',
      email: 'maria@email.com',
    }).returning();

    const [paciente2] = await db.insert(patients).values({
      organizationId: clinica.id,
      name: 'Pedro Oliveira',
      cpf: '666.666.666-66',
      phone: '(11) 95555-5555',
      email: 'pedro@email.com',
    }).returning();

    console.log('✅ Pacientes criados\n');

    // ========================================
    // 8. CRIAR PROCEDIMENTOS
    // ========================================
    console.log('⚕️ Criando procedimentos...');

    await db.insert(procedures).values([
      {
        organizationId: clinica.id,
        name: 'Limpeza',
        price: '150.00',
        durationMinutes: 30,
        category: 'Preventivo',
      },
      {
        organizationId: clinica.id,
        name: 'Restauração',
        price: '300.00',
        durationMinutes: 60,
        category: 'Restaurador',
      }
    ]);

    console.log('✅ Procedimentos criados\n');

    // ========================================
    // 9. CRIAR PRODUTOS (DENTAL SUPPLIER)
    // ========================================
    console.log('📦 Criando produtos do fornecedor...');

    await db.insert(products).values([
      {
        organizationId: dental.id,
        sku: 'LUV-001',
        name: 'Luva de Procedimento (Caixa 100un)',
        description: 'Luva de látex para procedimentos odontológicos',
        brand: 'Descarpack',
        category: 'Descartáveis',
        price: '45.00',
        stockQuantity: 500,
      },
      {
        organizationId: dental.id,
        sku: 'ANE-002',
        name: 'Anestésico Mepivacaína 2% (50 tubetes)',
        description: 'Anestésico local sem vasoconstritor',
        brand: 'DFL',
        category: 'Anestésicos',
        price: '120.00',
        stockQuantity: 200,
      },
      {
        organizationId: dental.id,
        sku: 'RES-003',
        name: 'Resina Composta A2 (Seringa 4g)',
        description: 'Resina fotopolimerizável cor A2',
        brand: '3M',
        category: 'Resinas',
        price: '85.00',
        stockQuantity: 150,
      }
    ]);

    console.log('✅ Produtos criados\n');

    // ========================================
    // 10. CRIAR PEDIDOS DE TESTE
    // ========================================
    console.log('📋 Criando pedidos de teste...');

    // Pedido 1: READY_FOR_PICKUP (esperando motoboy)
    await db.insert(orders).values({
      clinicId: clinica.id,
      labId: lab.id,
      dentistId: dentista.id,
      patientId: paciente1.id,
      description: 'Coroa de Porcelana - Dente 16',
      status: 'READY_FOR_PICKUP',
      price: '800.00',
      subtotal: '720.00',
      deliveryFee: '80.00',
      paymentStatus: 'PAID',
      deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 dias
    });

    // Pedido 2: IN_PRODUCTION (lab trabalhando)
    await db.insert(orders).values({
      clinicId: clinica.id,
      labId: lab.id,
      dentistId: dentista.id,
      patientId: paciente2.id,
      description: 'Prótese Total Superior',
      status: 'IN_PRODUCTION',
      price: '1500.00',
      subtotal: '1350.00',
      deliveryFee: '150.00',
      paymentStatus: 'PENDING',
      deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 dias
    });

    // Pedido 3: PENDING (recém criado)
    await db.insert(orders).values({
      clinicId: clinica.id,
      labId: lab.id,
      dentistId: dentista.id,
      patientId: paciente1.id,
      description: 'Aparelho Ortodôntico',
      status: 'PENDING',
      price: '2000.00',
      subtotal: '1800.00',
      deliveryFee: '200.00',
      paymentStatus: 'PENDING',
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 dias
    });

    console.log('✅ Pedidos criados\n');

    // ========================================
    // RESUMO
    // ========================================
    console.log('✨ SEED COMPLETO! ✨\n');
    console.log('═══════════════════════════════════════════════════════');
    console.log('📋 USUÁRIOS DE TESTE:');
    console.log('═══════════════════════════════════════════════════════');
    console.log('');
    console.log('1️⃣  DENTISTA');
    console.log('   Email: dentista@dentis.app');
    console.log('   Senha: DentisTest2024!@#');
    console.log('   Perfil: Professional (Dentista)');
    console.log('   Organização: Clínica Sorriso (Admin)');
    console.log('   Contexto: Dashboard Clínico');
    console.log('');
    console.log('2️⃣  LABORATÓRIO');
    console.log('   Email: lab@dentis.app');
    console.log('   Senha: DentisTest2024!@#');
    console.log('   Perfil: Nenhum (apenas Admin de Org)');
    console.log('   Organização: Lab Dental Art (Admin)');
    console.log('   Contexto: Dashboard Lab (Kanban)');
    console.log('');
    console.log('3️⃣  MOTOBOY');
    console.log('   Email: motoboy@dentis.app');
    console.log('   Senha: DentisTest2024!@#');
    console.log('   Perfil: Courier');
    console.log('   Organização: Nenhuma');
    console.log('   Contexto: App de Entregas');
    console.log('');
    console.log('4️⃣  FORNECEDOR (DENTAL)');
    console.log('   Email: dental@dentis.app');
    console.log('   Senha: DentisTest2024!@#');
    console.log('   Perfil: Nenhum (apenas Admin de Org)');
    console.log('   Organização: Dental Speed (Admin)');
    console.log('   Contexto: Dashboard Fornecedor (Produtos)');
    console.log('');
    console.log('═══════════════════════════════════════════════════════');
    console.log('📦 DADOS CRIADOS:');
    console.log('═══════════════════════════════════════════════════════');
    console.log('• 3 pedidos de serviços (Lab)');
    console.log('• 3 produtos de insumos (Dental)');
    console.log('• 2 pacientes');
    console.log('• 2 procedimentos');
    console.log('');
    console.log('🎯 TESTE RECOMENDADO:');
    console.log('1. Abra 4 abas anônimas');
    console.log('2. Faça login com cada usuário');
    console.log('3. Verifique que cada um vê apenas seu contexto');
    console.log('4. Motoboy deve ver 1 corrida disponível');
    console.log('5. Lab deve ver 3 pedidos no kanban');
    console.log('6. Dental deve ver 3 produtos no catálogo');
    console.log('═══════════════════════════════════════════════════════');

  } catch (error) {
    console.error('❌ Erro durante seed:', error);
    throw error;
  }
}

seed()
  .then(() => {
    console.log('\n✅ Seed finalizado com sucesso!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Erro fatal:', error);
    process.exit(1);
  });
