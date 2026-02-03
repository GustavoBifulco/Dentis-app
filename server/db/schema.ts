
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
  cost: numeric('cost'), // Added
  code: text('code'), // Added
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

// === Added Missing Tables ===

export const patientProfiles = pgTable('patient_profiles', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull(), // References users.id as string (legacy/compat)
  createdAt: timestamp('created_at').defaultNow(),
});

export const professionalProfiles = pgTable('professional_profiles', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull(),
  type: text('type').notNull(), // DENTIST, CLINIC_OWNER
  cro: text('cro'), // Nullable by default
  specialties: jsonb('specialties'),
  bio: text('bio'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const courierProfiles = pgTable('courier_profiles', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull(),
  vehicleType: text('vehicle_type'),
  plate: text('plate'),
  cnh: text('cnh'),
  active: boolean('active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
});

// === End Added Tables ===

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

// === Restored Tables (Fixing Build Errors) ===

export const auditLogs = pgTable('audit_logs', {
  id: serial('id').primaryKey(),
  organizationId: text('organization_id').notNull(),
  userId: text('user_id').notNull(),
  action: text('action').notNull(),
  resource: text('resource').notNull(),
  details: jsonb('details'),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const financials = pgTable('financials', {
  id: serial('id').primaryKey(),
  organizationId: text('organization_id').notNull(),
  type: text('type').notNull(), // 'income' | 'expense'
  amount: numeric('amount').notNull(),
  category: text('category'),
  description: text('description'),
  date: date('date').notNull(),
  status: text('status').default('paid'),
  paymentMethod: text('payment_method'),
  patientId: integer('patient_id'), // Optional link to patient
  createdAt: timestamp('created_at').defaultNow(),
});

export const clinicalRecords = pgTable('clinical_records', {
  id: serial('id').primaryKey(),
  organizationId: text('organization_id').notNull(),
  patientId: integer('patient_id').references(() => patients.id, { onDelete: 'cascade' }),
  dentistId: text('dentist_id').notNull(),
  type: text('type').notNull(), // 'anamnesis', 'exam', 'procedure', 'prescription'
  description: text('description'),
  attachments: jsonb('attachments'), // URLs to files
  date: date('date').defaultNow(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const documents = pgTable('documents', {
  id: serial('id').primaryKey(),
  organizationId: text('organization_id').notNull(),
  patientId: integer('patient_id').references(() => patients.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  type: text('type'), // 'laudo', 'raio-x', 'foto', 'contrato'
  url: text('url').notNull(),
  size: integer('size'),
  uploadedBy: text('uploaded_by'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const campaigns = pgTable('campaigns', {
  id: serial('id').primaryKey(),
  organizationId: text('organization_id').notNull(),
  name: text('name').notNull(),
  type: text('type').notNull(), // 'email', 'whatsapp', 'sms'
  status: text('status').default('draft'), // 'draft', 'scheduled', 'sent'
  content: text('content'),
  targetAudience: jsonb('target_audience'),
  scheduledAt: timestamp('scheduled_at'),
  sentAt: timestamp('sent_at'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const messageLogs = pgTable('message_logs', {
  id: serial('id').primaryKey(),
  organizationId: text('organization_id').notNull(),
  campaignId: integer('campaign_id').references(() => campaigns.id, { onDelete: 'set null' }),
  recipient: text('recipient').notNull(),
  channel: text('channel').notNull(),
  status: text('status').notNull(), // 'sent', 'delivered', 'read', 'failed'
  error: text('error'),
  sentAt: timestamp('sent_at').defaultNow(),
});

export const patientInvitations = pgTable('patient_invitations', {
  id: serial('id').primaryKey(),
  organizationId: text('organization_id').notNull(),
  email: text('email').notNull(),
  token: text('token').notNull().unique(),
  status: text('status').default('pending'), // 'pending', 'accepted', 'expired'
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Marketplace / Suppliers
export const catalogItems = pgTable('catalog_items', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  price: numeric('price').notNull(),
  imageUrl: text('image_url'),
  category: text('category'),
  supplierId: text('supplier_id').notNull(),
  active: boolean('active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
});

export const orders = pgTable('orders', {
  id: serial('id').primaryKey(),
  organizationId: text('organization_id').notNull(),
  supplierId: text('supplier_id').notNull(),
  status: text('status').default('pending'), // 'pending', 'processing', 'shipped', 'delivered', 'cancelled'
  totalAmount: numeric('total_amount').notNull(),
  items: jsonb('items').notNull(), // Array of { itemId, quantity, price }
  placedAt: timestamp('placed_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const chatMessages = pgTable('chat_messages', {
  id: serial('id').primaryKey(),
  organizationId: text('organization_id').notNull(),
  senderId: text('sender_id').notNull(),
  receiverId: text('receiver_id'), // Null for group/channel messages
  channelId: text('channel_id'),   // Null for direct messages
  content: text('content').notNull(),
  read: boolean('read').default(false),
  createdAt: timestamp('created_at').defaultNow(),
});
