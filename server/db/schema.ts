import { pgTable, serial, text, integer, decimal, timestamp, boolean, json } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// --- 1. IDENTIDADE GLOBAL (QUEM VOCÊ É) ---

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  clerkId: text('clerk_id').unique().notNull(),
  email: text('email').unique(),
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
  type: text('type').notNull().default('CLINIC'), // 'CLINIC', 'LAB'
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

export const orders = pgTable('orders', {
  id: serial('id').primaryKey(),
  requesterId: integer('clinic_id').references(() => organizations.id).notNull(),
  providerId: integer('lab_id').references(() => organizations.id),
  dentistId: integer('dentist_id').references(() => users.id).notNull(),
  patientId: integer('patient_id').references(() => patients.id),
  status: text('status').notNull(),
  price: decimal('price', { precision: 10, scale: 2 }),
  deliveryFee: decimal('delivery_fee', { precision: 10, scale: 2 }),
  courierId: integer('courier_id').references(() => users.id),
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
