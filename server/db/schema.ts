import { pgTable, serial, text, integer, decimal, timestamp, boolean, json } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// --- 1. IDENTIDADE GLOBAL (QUEM VOCÊ É) ---

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  clerkId: text('clerk_id').unique().notNull(),
  email: text('email').unique(),
  cpf: text('cpf').unique(), // CPF brasileiro para unicidade de identidade
  name: text('name'),
  surname: text('surname'),
  avatarUrl: text('avatar_url'),
  isActive: boolean('is_active').default(true),
  onboardingComplete: boolean('onboarding_complete').default(false),
  createdAt: timestamp('created_at').defaultNow(),
});

// Profissional de Saúde (Dentista, Técnico, etc.)
export const professionalProfiles = pgTable('professional_profiles', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull().unique(),
  cro: text('cro'), // Registro Profissional
  specialty: text('specialty'), // Ortodontia, Implante, etc.
  type: text('type'), // 'DENTIST', 'PROTETICO', 'AUXILIAR'
  createdAt: timestamp('created_at').defaultNow(),
});

// Perfil de Logística (Courier)
export const courierProfiles = pgTable('courier_profiles', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull().unique(),
  vehicle: text('vehicle'), // MOTO, CARRO, etc.
  licensePlate: text('license_plate'),
  isOnline: boolean('is_online').default(false),
  latitude: decimal('latitude', { precision: 10, scale: 7 }),
  longitude: decimal('longitude', { precision: 10, scale: 7 }),
  lastLocationUpdate: timestamp('last_location_update'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Perfil de Paciente (Dados de Saúde)
export const patientProfiles = pgTable('patient_profiles', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull().unique(),
  healthHistory: text('health_history'),
  createdAt: timestamp('created_at').defaultNow(),
});

// --- 2. PERMISSÕES E ORGANIZAÇÃO (ONDE VOCÊ ATUA) ---

export const organizations = pgTable('clinics', { // Mantendo nome 'clinics' no DB para compatibilidade
  id: serial('id').primaryKey(),
  clerkOrgId: text('clerk_org_id').unique().notNull(), // Identificador do Clerk
  name: text('name').notNull(),
  type: text('type').notNull().default('CLINIC'), // 'CLINIC', 'LAB', 'SUPPLIER'
  status: text('status').notNull().default('ACTIVE'),
  cnpj: text('cnpj'),
  phone: text('phone'),
  address: text('address'),
  walletBalance: decimal('wallet_balance', { precision: 12, scale: 2 }).default('0.00'),
  latitude: decimal('latitude', { precision: 10, scale: 7 }),
  longitude: decimal('longitude', { precision: 10, scale: 7 }),
  createdAt: timestamp('created_at').defaultNow(),
});

export const organizationMembers = pgTable('clinic_members', { // Mantendo nome 'clinic_members'
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  organizationId: integer('clinic_id').references(() => organizations.id).notNull(),
  role: text('role').notNull(), // 'admin', 'basic_member' (Roles do Clerk)
  createdAt: timestamp('created_at').defaultNow(),
});

// --- 3. DOMÍNIO DE NEGÓCIO ---

export const patients = pgTable('patients', {
  id: serial('id').primaryKey(),
  organizationId: integer('clinic_id').references(() => organizations.id).notNull(),
  name: text('name').notNull(),
  cpf: text('cpf'),
  phone: text('phone'),
  email: text('email'),
  lastVisit: timestamp('last_visit'),
  userId: integer('user_id').references(() => users.id), // Opcional: Link com Identidade se o paciente for usuário do app
});

export const procedures = pgTable('procedures', {
  id: serial('id').primaryKey(),
  organizationId: integer('clinic_id').references(() => organizations.id).notNull(),
  name: text('name').notNull(),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  durationMinutes: integer('duration_minutes'),
  category: text('category'),
});

export const appointments = pgTable('appointments', {
  id: serial('id').primaryKey(),
  organizationId: integer('clinic_id').references(() => organizations.id).notNull(),
  patientId: integer('patient_id').references(() => patients.id).notNull(),
  dentistId: integer('dentist_id').references(() => users.id).notNull(), // Link com ID de Identidade
  startTime: timestamp('start_time').notNull(),
  endTime: timestamp('end_time').notNull(),
  status: text('status').notNull(),
});

export const catalogItems = pgTable('catalog_items', {
  id: serial('id').primaryKey(),
  organizationId: integer('organization_id').references(() => organizations.id).notNull(),
  name: text('name').notNull(),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  productionDays: integer('production_days').default(3),
});

// Tabela de Produtos (SKU) - Para Fornecedores de Insumos (Dentais)
export const products = pgTable('products', {
  id: serial('id').primaryKey(),
  organizationId: integer('organization_id').references(() => organizations.id).notNull(), // Fornecedor
  sku: text('sku').notNull().unique(), // Código do produto
  name: text('name').notNull(),
  description: text('description'),
  brand: text('brand'), // Marca
  category: text('category'), // Descartáveis, Anestésicos, Resinas, etc.
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  stockQuantity: integer('stock_quantity').default(0),
  createdAt: timestamp('created_at').defaultNow(),
});

export const orders = pgTable('orders', {
  id: serial('id').primaryKey(),
  clinicId: integer('clinic_id').references(() => organizations.id).notNull(), // Requester (Clinic)
  labId: integer('lab_id').references(() => organizations.id), // Provider (Lab)
  dentistId: integer('dentist_id').references(() => users.id).notNull(),
  patientId: integer('patient_id').references(() => patients.id),
  description: text('description').notNull(),
  status: text('status').notNull(), // PENDING, IN_PRODUCTION, READY, DRIVER_ASSIGNED, IN_TRANSIT, DELIVERED
  price: decimal('price', { precision: 10, scale: 2 }),
  subtotal: decimal('subtotal', { precision: 10, scale: 2 }), // Lab gets
  deliveryFee: decimal('delivery_fee', { precision: 10, scale: 2 }),
  paymentStatus: text('payment_status').default('PENDING'), // PENDING, PAID
  courierId: integer('courier_id').references(() => users.id),
  pickupCode: text('pickup_code'),
  deliveryCode: text('delivery_code'),
  deadline: timestamp('deadline'),
  createdAt: timestamp('created_at').defaultNow(),
});

// --- RELAÇÕES ---

export const usersRelations = relations(users, ({ one, many }) => ({
  professionalProfile: one(professionalProfiles, { fields: [users.id], references: [professionalProfiles.userId] }),
  courierProfile: one(courierProfiles, { fields: [users.id], references: [courierProfiles.userId] }),
  patientProfile: one(patientProfiles, { fields: [users.id], references: [patientProfiles.userId] }),
  memberships: many(organizationMembers),
}));

export const organizationsRelations = relations(organizations, ({ many }) => ({
  members: many(organizationMembers),
  patients: many(patients),
  ordersAsRequester: many(orders, { relationName: 'requester' }),
  ordersAsProvider: many(orders, { relationName: 'provider' }),
}));

export const organizationMembersRelations = relations(organizationMembers, ({ one }) => ({
  user: one(users, { fields: [organizationMembers.userId], references: [users.id] }),
  organization: one(organizations, { fields: [organizationMembers.organizationId], references: [organizations.id] }),
}));
