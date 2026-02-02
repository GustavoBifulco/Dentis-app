import { pgTable, serial, text, integer, decimal, timestamp, boolean, date, json } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  clerkId: text('clerk_id').unique().notNull(),
  email: text('email'),
  name: text('name'),
  surname: text('surname'),
  role: text('role').notNull(),
  avatarUrl: text('avatar_url'),
  isActive: boolean('is_active').default(true),
  onboardingComplete: boolean('onboarding_complete').default(false),
});

export const clinics = pgTable('clinics', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  address: text('address'),
  phone: text('phone'),
  kioskToken: text('kiosk_token'),
  clerkOrgId: text('clerk_org_id'), // Mapeamento para Organização do Clerk
});

export const clinicMembers = pgTable('clinic_members', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  clinicId: integer('clinic_id').references(() => clinics.id).notNull(),
  role: text('role').notNull(), // OWNER, ADMIN, DENTIST, RECEPTIONIST
});

export const inventory = pgTable('inventory', {
  id: serial('id').primaryKey(),
  clinicId: integer('clinic_id').references(() => clinics.id).notNull(),
  name: text('name').notNull(),
  category: text('category').notNull(),
  quantity: integer('quantity').notNull().default(0),
  unit: text('unit').notNull(),
  minLevel: integer('min_level').notNull().default(5),
  userId: integer('user_id').references(() => users.id).notNull(),
});

export const procedures = pgTable('procedures', {
  id: serial('id').primaryKey(),
  clinicId: integer('clinic_id').references(() => clinics.id).notNull(),
  name: text('name').notNull(),
  code: text('code'),
  tussCode: text('tuss_code'),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  cost: decimal('cost', { precision: 10, scale: 2 }).default('0.00'),
  duration: integer('duration').notNull(), // Minutes
  durationMinutes: integer('duration_minutes'), // Alias/Alternative for seeding compatibility or explicit clarity
  category: text('category'),
  userId: integer('user_id').references(() => users.id).notNull(),
});

export const patients = pgTable('patients', {
  id: serial('id').primaryKey(),
  clinicId: integer('clinic_id').references(() => clinics.id).notNull(),
  name: text('name').notNull(),
  email: text('email'),
  phone: text('phone'),
  cpf: text('cpf'),
  lastVisit: timestamp('last_visit'),
  userId: integer('user_id').references(() => users.id).notNull(),
});

export const appointments = pgTable('appointments', {
  id: serial('id').primaryKey(),
  clinicId: integer('clinic_id').references(() => clinics.id).notNull(),
  patientId: integer('patient_id').references(() => patients.id).notNull(),
  dentistId: integer('dentist_id').references(() => users.id).notNull(),
  procedureId: integer('procedure_id').references(() => procedures.id),
  procedureName: text('procedure_name'),
  startTime: timestamp('start_time').notNull(),
  endTime: timestamp('end_time').notNull(),
  status: text('status').notNull(), // scheduled, completed, cancelled, no-show
  notes: text('notes'),
});

export const orders = pgTable('orders', {
  id: serial('id').primaryKey(),
  clinicId: integer('clinic_id').references(() => clinics.id).notNull(),
  dentistId: integer('dentist_id').references(() => users.id).notNull(),
  patientId: integer('patient_id').references(() => patients.id),
  appointmentId: integer('appointment_id').references(() => appointments.id), // Optional link
  labName: text('lab_name').notNull(),
  description: text('description').notNull(),
  cost: decimal('cost', { precision: 10, scale: 2 }).default('0.00'),
  status: text('status').notNull(), // PENDING, SENT, RECEIVED
  createdAt: timestamp('created_at').defaultNow(),
});

export const financial = pgTable('financial', {
  id: serial('id').primaryKey(),
  clinicId: integer('clinic_id').references(() => clinics.id).notNull(),
  patientId: integer('patient_id').references(() => patients.id),
  appointmentId: integer('appointment_id').references(() => appointments.id),
  userId: integer('user_id').references(() => users.id), // Link to Dentist/Use
  type: text('type').notNull(), // INCOME, EXPENSE
  description: text('description').notNull(),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  status: text('status').notNull(), // PENDING, PAID, OVERDUE
  dueDate: timestamp('due_date').notNull(),
  category: text('category'),
});

export const clinicalRecords = pgTable('clinical_records', {
  id: serial('id').primaryKey(),
  clinicId: integer('clinic_id').references(() => clinics.id).notNull(),
  patientId: integer('patient_id').references(() => patients.id).notNull(),
  dentistId: integer('dentist_id').references(() => users.id).notNull(),
  date: timestamp('date').notNull().defaultNow(),
  description: text('description'),
  teeth: text('teeth'), // JSON or comma-separated
  type: text('type').notNull(), // ANAMNESIS, EXAM, PROCEDURE, PRESCRIPTION
  data: json('data'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const campaigns = pgTable('campaigns', {
  id: serial('id').primaryKey(),
  clinicId: integer('clinic_id').references(() => clinics.id).notNull(),
  creatorId: integer('creator_id').references(() => users.id).notNull(),
  name: text('name').notNull(),
  status: text('status').notNull(), // DRAFT, SENT, SCHEDULED
  type: text('type').notNull(), // EMAIL, SMS, WHATSAPP
  targetAudience: text('target_audience'),
  messageTemplate: text('message_template').notNull(),
  scheduledFor: timestamp('scheduled_for'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const messageLogs = pgTable('message_logs', {
  id: serial('id').primaryKey(),
  campaignId: integer('campaign_id').references(() => campaigns.id),
  patientId: integer('patient_id').references(() => patients.id).notNull(),
  channel: text('channel').notNull(),
  status: text('status').notNull(), // SENT, DELIVERED, READ, FAILED
  sentAt: timestamp('sent_at').defaultNow(),
});

export const documents = pgTable('documents', {
  id: serial('id').primaryKey(),
  clinicId: integer('clinic_id').references(() => clinics.id).notNull(),
  patientId: integer('patient_id').references(() => patients.id),
  filename: text('filename').notNull(),
  url: text('url').notNull(),
  type: text('type').notNull(),
  uploadedBy: integer('uploaded_by').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  clinicMembers: many(clinicMembers),
  orders: many(orders),
  financialRecords: many(financial),
}));

export const clinicsRelations = relations(clinics, ({ many }) => ({
  members: many(clinicMembers),
  patients: many(patients),
  appointments: many(appointments),
  procedures: many(procedures),
  inventory: many(inventory),
  financial: many(financial),
  orders: many(orders),
}));

export const clinicMembersRelations = relations(clinicMembers, ({ one }) => ({
  user: one(users, {
    fields: [clinicMembers.userId],
    references: [users.id],
  }),
  clinic: one(clinics, {
    fields: [clinicMembers.clinicId],
    references: [clinics.id],
  }),
}));

export const appointmentsRelations = relations(appointments, ({ one, many }) => ({
  patient: one(patients, {
    fields: [appointments.patientId],
    references: [patients.id],
  }),
  dentist: one(users, {
    fields: [appointments.dentistId],
    references: [users.id],
  }),
  orders: many(orders),
}));

export const campaignsRelations = relations(campaigns, ({ one, many }) => ({
  creator: one(users, {
    fields: [campaigns.creatorId],
    references: [users.id],
  }),
  logs: many(messageLogs),
}));

export const messageLogsRelations = relations(messageLogs, ({ one }) => ({
  campaign: one(campaigns, {
    fields: [messageLogs.campaignId],
    references: [campaigns.id],
  }),
  patient: one(patients, {
    fields: [messageLogs.patientId],
    references: [patients.id],
  }),
}));

export const ordersRelations = relations(orders, ({ one }) => ({
  clinic: one(clinics, {
    fields: [orders.clinicId],
    references: [clinics.id],
  }),
  dentist: one(users, {
    fields: [orders.dentistId],
    references: [users.id],
  }),
  patient: one(patients, {
    fields: [orders.patientId],
    references: [patients.id],
  }),
  appointment: one(appointments, {
    fields: [orders.appointmentId],
    references: [appointments.id],
  }),
}));

export const financialRelations = relations(financial, ({ one }) => ({
  clinic: one(clinics, {
    fields: [financial.clinicId],
    references: [clinics.id],
  }),
  user: one(users, {
    fields: [financial.userId],
    references: [users.id],
  }),
}));
