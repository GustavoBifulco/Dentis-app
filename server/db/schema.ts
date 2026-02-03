import { pgTable, serial, text, timestamp, integer, jsonb, boolean } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  clerkId: text('clerk_id').unique().notNull(),
  role: text('role').notNull(),
  name: text('name').notNull(),
  email: text('email'),
  cpf: text('cpf'),
  phone: text('phone'),
  organizationId: text('organization_id'), // Added for consistency with routes
  avatarUrl: text('avatar_url'), // Added as it was missing in some routes
  profileData: jsonb('profile_data').default({}),
  onboardingComplete: timestamp('onboarding_complete'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const organizations = pgTable('organizations', {
  id: serial('id').primaryKey(),
  clerkOrgId: text('clerk_org_id').unique().notNull(),
  name: text('name').notNull(),
  slug: text('slug'),
  type: text('type').default('CLINIC'), // 'CLINIC', 'LAB', 'RETAIL'
  status: text('status').default('ACTIVE'), // 'ACTIVE', 'SHADOW', 'INACTIVE'
  phone: text('phone'),
  address: text('address'),
  latitude: text('latitude'),
  longitude: text('longitude'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const organizationMembers = pgTable('organization_members', {
  id: serial('id').primaryKey(),
  organizationId: integer('organization_id').references(() => organizations.id),
  userId: integer('user_id').references(() => users.id),
  role: text('role').notNull(), // 'ADMIN', 'MEMBER', etc.
  createdAt: timestamp('created_at').defaultNow(),
});

export const professionalProfiles = pgTable('professional_profiles', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  type: text('type').notNull(), // 'DENTIST', 'OWNER'
  cro: text('cro'),
  specialties: jsonb('specialties').default([]),
  createdAt: timestamp('created_at').defaultNow(),
});

export const patientProfiles = pgTable('patient_profiles', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  medicalConditions: jsonb('medical_conditions').default([]),
  createdAt: timestamp('created_at').defaultNow(),
});

export const courierProfiles = pgTable('courier_profiles', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  latitude: text('latitude'),
  longitude: text('longitude'),
  isOnline: boolean('is_online').default(false),
  lastLocationUpdate: timestamp('last_location_update'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const patients = pgTable('patients', {
  id: serial('id').primaryKey(),
  organizationId: text('organization_id').notNull().default('org-1'),
  userId: text('user_id'),
  name: text('name').notNull(),
  cpf: text('cpf'),
  phone: text('phone'),
  email: text('email'),
  lastVisit: timestamp('last_visit'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const procedures = pgTable('procedures', {
  id: serial('id').primaryKey(),
  organizationId: text('organization_id').notNull().default('org-1'),
  name: text('name').notNull(),
  description: text('description'),
  price: text('price').notNull(),
  tussCode: text('tuss_code'),
  code: text('code'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const appointments = pgTable('appointments', {
  id: serial('id').primaryKey(),
  organizationId: text('organization_id').notNull().default('org-1'),
  patientId: integer('patient_id').references(() => patients.id),
  dentistId: text('dentist_id').notNull(),
  startTime: timestamp('start_time').notNull(),
  endTime: timestamp('end_time'),
  status: text('status').notNull().default('scheduled'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const clinicalRecords = pgTable('clinical_records', {
  id: serial('id').primaryKey(),
  organizationId: text('organization_id').notNull().default('org-1'),
  patientId: integer('patient_id').references(() => patients.id),
  dentistId: text('dentist_id').notNull(),
  date: timestamp('date').defaultNow(),
  treatment: text('treatment').notNull(),
  notes: text('notes'),
  attachments: jsonb('attachments').default([]),
  createdAt: timestamp('created_at').defaultNow(),
});

export const financials = pgTable('financials', {
  id: serial('id').primaryKey(),
  organizationId: text('organization_id').notNull().default('org-1'),
  patientId: integer('patient_id').references(() => patients.id),
  amount: integer('amount').notNull(),
  description: text('description').notNull(),
  status: text('status').default('pending'),
  dueDate: timestamp('due_date'),
  paidAt: timestamp('paid_at'),
  paymentMethod: text('payment_method'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const orders = pgTable('orders', {
  id: serial('id').primaryKey(),
  organizationId: text('organization_id').notNull().default('org-1'),
  patientId: integer('patient_id').references(() => patients.id),
  labId: integer('lab_id').references(() => organizations.id),
  dentistId: text('dentist_id'),
  courierId: integer('courier_id'),
  description: text('description').notNull(),
  status: text('status').notNull().default('requested'),
  price: text('price'),
  subtotal: text('subtotal'),
  deliveryFee: text('delivery_fee'),
  deadline: timestamp('deadline'),
  isDigital: boolean('is_digital').default(false),
  stlFileUrl: text('stl_file_url'),
  paymentStatus: text('payment_status').default('PENDING'),
  pickupCode: text('pickup_code'),
  deliveryCode: text('delivery_code'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const documents = pgTable('documents', {
  id: serial('id').primaryKey(),
  organizationId: text('organization_id').notNull().default('org-1'), // Added for multi-tenancy
  patientId: integer('patient_id').references(() => patients.id),
  name: text('name').notNull(),
  type: text('type').notNull(), // 'LAB_SCAN', 'PRESCRIPTION', etc.
  url: text('url').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const campaigns = pgTable('campaigns', {
  id: serial('id').primaryKey(),
  organizationId: text('organization_id').notNull(),
  creatorId: text('creator_id'),
  name: text('name').notNull(),
  type: text('type').notNull(), // 'WHATSAPP', 'EMAIL'
  targetAudience: text('target_audience'),
  messageTemplate: text('message_template'),
  status: text('status').default('DRAFT'),
  scheduledFor: timestamp('scheduled_for'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const messageLogs = pgTable('message_logs', {
  id: serial('id').primaryKey(),
  campaignId: integer('campaign_id').references(() => campaigns.id),
  patientId: integer('patient_id').references(() => patients.id),
  channel: text('channel'),
  status: text('status'),
  sentAt: timestamp('sent_at'),
});

export const invites = pgTable('invites', {
  id: serial('id').primaryKey(),
  token: text('token').unique().notNull(),
  inviterOrganizationId: integer('inviter_organization_id').references(() => organizations.id),
  inviterUserId: integer('inviter_user_id').references(() => users.id),
  invitedName: text('invited_name'),
  invitedPhone: text('invited_phone'),
  targetOrganizationId: integer('target_organization_id').references(() => organizations.id),
  status: text('status').default('PENDING'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const auditLogs = pgTable('audit_logs', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  action: text('action').notNull(),
  resourceType: text('resource_type').notNull(),
  resourceId: text('resource_id'),
  tenantId: text('tenant_id'), // Changed to text to match organizationId
  ip: text('ip'),
  reason: text('reason'),
  details: text('details'),
  timestamp: timestamp('timestamp').defaultNow(),
});

export const catalogItems = pgTable('catalog_items', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  price: text('price').notNull(),
  category: text('category'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const chatMessages = pgTable('chat_messages', {
  id: serial('id').primaryKey(),
  organizationId: text('organization_id').notNull().default('org-1'), // Added for multi-tenancy
  caseId: integer('case_id').references(() => appointments.id),
  senderId: text('sender_id').notNull(),
  content: text('content').notNull(),
  attachments: jsonb('attachments').default([]),
  createdAt: timestamp('created_at').defaultNow(),
});


