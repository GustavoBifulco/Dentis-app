import { pgTable, serial, text, timestamp, integer, jsonb, boolean, numeric, date, time } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  clerkId: text('clerk_id').unique().notNull(),
  role: text('role').notNull(),
  name: text('name').notNull(),
  email: text('email'),
  cpf: text('cpf'),
  phone: text('phone'),
  birthdate: text('birthdate'),
  address: text('address'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const organizations = pgTable('organizations', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const organizationMembers = pgTable('organization_members', {
  id: serial('id').primaryKey(),
  organizationId: text('organization_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull(),
  role: text('role').notNull(),
  joinedAt: timestamp('joined_at').defaultNow(),
});

export const patients = pgTable('patients', {
  id: serial('id').primaryKey(),
  organizationId: text('organization_id').notNull(),
  name: text('name').notNull(),
  cpf: text('cpf'),
  phone: text('phone'),
  email: text('email'),
  birthdate: text('birthdate'),
  address: text('address'),
  medicalHistory: text('medical_history'),
  allergies: text('allergies'),
  medications: text('medications'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const procedures = pgTable('procedures', {
  id: serial('id').primaryKey(),
  organizationId: text('organization_id').notNull(),
  name: text('name').notNull(),
  category: text('category'),
  subcategory: text('subcategory'),
  description: text('description'),
  price: numeric('price'),
  duration: integer('duration'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const inventory = pgTable('inventory', {
  id: serial('id').primaryKey(),
  organizationId: text('organization_id').notNull().default('org-1'),
  name: text('name').notNull(),
  category: text('category'),
  quantity: integer('quantity').default(0),
  minQuantity: integer('min_quantity').default(0),
  unit: text('unit'),
  price: numeric('price'),
  supplier: text('supplier'),
  link: text('link'),
  minStock: integer('min_stock'),
  currentStock: integer('current_stock'),
  photoUrl: text('photo_url'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const templateProcedures = pgTable('template_procedures', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  category: text('category'),
  subcategory: text('subcategory'),
  description: text('description'),
  price: text('price').notNull(),
  duration: integer('duration'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const templateInventory = pgTable('template_inventory', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  category: text('category'),
  quantity: integer('quantity').default(0),
  minQuantity: integer('min_quantity').default(0),
  unit: text('unit'),
  price: numeric('price'),
  supplier: text('supplier'),
  link: text('link'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Appointment System Tables
export const appointments = pgTable('appointments', {
  id: serial('id').primaryKey(),
  organizationId: text('organization_id').notNull(),
  patientId: integer('patient_id').references(() => patients.id, { onDelete: 'cascade' }),
  dentistId: text('dentist_id').notNull(),

  // Scheduling
  scheduledDate: date('scheduled_date').notNull(),
  scheduledTime: time('scheduled_time').notNull(),
  duration: integer('duration').default(60),
  status: text('status').default('pending'),

  // Clinical
  appointmentType: text('appointment_type').default('consulta'),
  procedureId: integer('procedure_id').references(() => procedures.id, { onDelete: 'set null' }),
  notes: text('notes'),
  chiefComplaint: text('chief_complaint'),

  // Follow-up
  isFollowup: boolean('is_followup').default(false),
  parentAppointmentId: integer('parent_appointment_id'),

  // Notifications
  notifyPatient: boolean('notify_patient').default(true),
  notificationSent: boolean('notification_sent').default(false),
  notificationSentAt: timestamp('notification_sent_at'),
  confirmationRequired: boolean('confirmation_required').default(true),
  confirmedAt: timestamp('confirmed_at'),
  confirmedBy: text('confirmed_by'),

  // Reminders
  reminder24hSent: boolean('reminder_24h_sent').default(false),
  reminder2hSent: boolean('reminder_2h_sent').default(false),

  // Metadata
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  cancelledAt: timestamp('cancelled_at'),
  cancellationReason: text('cancellation_reason'),
});

export const appointmentSettings = pgTable('appointment_settings', {
  id: serial('id').primaryKey(),
  organizationId: text('organization_id').notNull().unique(),

  // Availability
  allowPatientBooking: boolean('allow_patient_booking').default(false),
  bookingAdvanceDays: integer('booking_advance_days').default(30),
  bookingBufferHours: integer('booking_buffer_hours').default(24),

  // Working hours
  workingHours: jsonb('working_hours'),

  // Slot config
  defaultSlotDuration: integer('default_slot_duration').default(60),
  slotInterval: integer('slot_interval').default(30),
  maxAppointmentsPerDay: integer('max_appointments_per_day').default(10),

  // WhatsApp
  whatsappEnabled: boolean('whatsapp_enabled').default(false),
  whatsappNumber: text('whatsapp_number'),
  sendConfirmationRequests: boolean('send_confirmation_requests').default(true),
  sendReminders: boolean('send_reminders').default(true),
  reminder24hEnabled: boolean('reminder_24h_enabled').default(true),
  reminder2hEnabled: boolean('reminder_2h_enabled').default(true),

  // Exceptions
  blockedDates: jsonb('blocked_dates'),
  specialHours: jsonb('special_hours'),

  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const appointmentRequests = pgTable('appointment_requests', {
  id: serial('id').primaryKey(),
  organizationId: text('organization_id').notNull(),
  patientId: integer('patient_id').references(() => patients.id, { onDelete: 'cascade' }),

  // Request
  requestedDate: date('requested_date').notNull(),
  requestedTime: time('requested_time').notNull(),
  preferredDuration: integer('preferred_duration').default(60),
  reason: text('reason').notNull(),
  urgency: text('urgency').default('normal'),

  // Status
  status: text('status').default('pending'),
  reviewedBy: text('reviewed_by'),
  reviewedAt: timestamp('reviewed_at'),
  rejectionReason: text('rejection_reason'),

  // Link
  appointmentId: integer('appointment_id').references(() => appointments.id, { onDelete: 'set null' }),

  createdAt: timestamp('created_at').defaultNow(),
  expiresAt: timestamp('expires_at'),
});

export const notificationLogs = pgTable('notification_logs', {
  id: serial('id').primaryKey(),
  organizationId: text('organization_id').notNull(),
  appointmentId: integer('appointment_id').references(() => appointments.id, { onDelete: 'cascade' }),
  patientId: integer('patient_id').references(() => patients.id, { onDelete: 'cascade' }),

  // Type
  notificationType: text('notification_type').notNull(),
  channel: text('channel').default('app'),

  // Content
  message: text('message').notNull(),
  templateId: text('template_id'),

  // Status
  status: text('status').default('pending'),
  sentAt: timestamp('sent_at'),
  deliveredAt: timestamp('delivered_at'),
  readAt: timestamp('read_at'),
  failedAt: timestamp('failed_at'),
  errorMessage: text('error_message'),

  // Response
  responseReceived: boolean('response_received').default(false),
  responseText: text('response_text'),
  responseAt: timestamp('response_at'),

  createdAt: timestamp('created_at').defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  organizationMembers: many(organizationMembers),
}));

export const organizationsRelations = relations(organizations, ({ many }) => ({
  members: many(organizationMembers),
}));

export const organizationMembersRelations = relations(organizationMembers, ({ one }) => ({
  user: one(users, {
    fields: [organizationMembers.userId],
    references: [users.id],
  }),
  organization: one(organizations, {
    fields: [organizationMembers.organizationId],
    references: [organizations.id],
  }),
}));

export const appointmentsRelations = relations(appointments, ({ one, many }) => ({
  patient: one(patients, {
    fields: [appointments.patientId],
    references: [patients.id],
  }),
  procedure: one(procedures, {
    fields: [appointments.procedureId],
    references: [procedures.id],
  }),
  parentAppointment: one(appointments, {
    fields: [appointments.parentAppointmentId],
    references: [appointments.id],
  }),
  notificationLogs: many(notificationLogs),
}));

export const appointmentRequestsRelations = relations(appointmentRequests, ({ one }) => ({
  patient: one(patients, {
    fields: [appointmentRequests.patientId],
    references: [patients.id],
  }),
  appointment: one(appointments, {
    fields: [appointmentRequests.appointmentId],
    references: [appointments.id],
  }),
}));

export const notificationLogsRelations = relations(notificationLogs, ({ one }) => ({
  appointment: one(appointments, {
    fields: [notificationLogs.appointmentId],
    references: [appointments.id],
  }),
  patient: one(patients, {
    fields: [notificationLogs.patientId],
    references: [patients.id],
  }),
}));
