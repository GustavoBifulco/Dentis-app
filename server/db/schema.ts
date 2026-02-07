
import { pgTable, serial, text, timestamp, integer, jsonb, boolean, numeric, date, time, index } from 'drizzle-orm/pg-core';
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
  avatarUrl: text('avatar_url'), // Profile picture URL
  preferences: jsonb('preferences'), // { theme: 'dark'|'light', primaryColor: string }
  onboardingComplete: boolean('onboarding_complete').default(false),
  planType: text('plan_type').default('free'), // free, dentis_pro
  stripeCustomerId: text('stripe_customer_id'),
  stripeConnectedAccountId: text('stripe_connected_account_id'), // For solo professionals
  // Patient authentication fields
  passwordHash: text('password_hash'), // For patients with custom auth
  emailVerified: boolean('email_verified').default(false),
  verificationToken: text('verification_token'),
  resetPasswordToken: text('reset_password_token'),
  resetPasswordExpires: timestamp('reset_password_expires'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Sessions table for patient authentication
export const sessions = pgTable('sessions', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull(),
  token: text('token').notNull().unique(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.clerkId],
  }),
}));

export const organizations = pgTable('organizations', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  type: text('type').default('CLINIC'), // CLINIC, LAB
  createdAt: timestamp('created_at').defaultNow(),
});

export const organizationMembers = pgTable('organization_members', {
  id: serial('id').primaryKey(),
  organizationId: text('organization_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull(),
  role: text('role').notNull(),
  joinedAt: timestamp('joined_at').defaultNow(),
});

// Address Table (New, Normalized)
export const addresses = pgTable('addresses', {
  id: serial('id').primaryKey(),
  organizationId: text('organization_id').notNull(),
  street: text('street'),
  number: text('number'),
  complement: text('complement'),
  neighborhood: text('neighborhood'),
  city: text('city'),
  state: text('state'),
  postalCode: text('postal_code'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const patients = pgTable('patients', {
  id: serial('id').primaryKey(),
  organizationId: text('organization_id').notNull(),

  // Link to User Account (quando o paciente criar conta via convite)
  userId: text('user_id'), // References Clerk userId

  // Dados Pessoais
  name: text('name').notNull(),
  socialName: text('social_name'),
  gender: text('gender'),
  birthdate: text('birthdate'),
  placeOfBirth: text('place_of_birth'),
  maritalStatus: text('marital_status'),
  occupation: text('occupation'),
  educationLevel: text('education_level'),

  // Documentos
  cpf: text('cpf'),
  rg: text('rg'),
  cns: text('cns'), // Cartão SUS

  // Contato
  phone: text('phone'),
  email: text('email'),
  contactPreference: text('contact_preference'), // 'whatsapp', 'email', 'phone'

  // Endereço (Link)
  addressId: integer('address_id').references(() => addresses.id),
  // Legacy address field (keep for back-compat or migration)
  address: text('address'),
  avatarUrl: text('avatar_url'), // Patient Profile Picture

  // Responsável Legal (<18 ou incapaz)
  legalGuardianName: text('legal_guardian_name'),
  legalGuardianRelationship: text('legal_guardian_relationship'),
  legalGuardianPhone: text('legal_guardian_phone'),

  // Empresa/Benefício
  companyName: text('company_name'),

  // Dados Clínicos (Legacy/Summary)
  medicalHistory: text('medical_history'),
  allergies: text('allergies'),
  medications: text('medications'),

  status: text('status').default('active'), // active, archived

  // Audit fields (LGPD compliance)
  createdBy: text('created_by'), // User ID who created this record
  updatedBy: text('updated_by'), // User ID who last updated this record

  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  // Performance indexes
  orgStatusIdx: index('patients_org_status_idx').on(table.organizationId, table.status),
  orgCreatedIdx: index('patients_org_created_idx').on(table.organizationId, table.createdAt),
  userIdIdx: index('patients_user_id_idx').on(table.userId),
}));

// Emergency Contacts (1:N)
export const patientEmergencyContacts = pgTable('patient_emergency_contacts', {
  id: serial('id').primaryKey(),
  patientId: integer('patient_id').references(() => patients.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  relationship: text('relationship'),
  phone: text('phone').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Insurances (1:N)
export const patientInsurances = pgTable('patient_insurances', {
  id: serial('id').primaryKey(),
  patientId: integer('patient_id').references(() => patients.id, { onDelete: 'cascade' }),
  providerName: text('provider_name').notNull(),
  cardNumber: text('card_number'),
  validUntil: text('valid_until'),
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
  bom: jsonb('bom'), // Array of { itemId, name, quantity, unitCost }
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

// === Clinic Provisioning & Management ===

export const clinics = pgTable('clinics', {
  id: text('id').primaryKey(), // Using text to match organizations.id usually, or uuid if we want internal
  clerkOrganizationId: text('clerk_organization_id').unique().notNull(), // The link to Clerk
  name: text('name').notNull(),
  seats: integer('seats').default(1),
  planType: text('plan_type').default('clinic_id'), // clinic_id, clinic_id_plus, clinic_id_pro
  stripeCustomerId: text('stripe_customer_id'),
  stripeConnectedAccountId: text('stripe_connected_account_id'), // Connect V2
  subscriptionId: text('subscription_id'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const clinicMemberships = pgTable('clinic_memberships', {
  id: serial('id').primaryKey(),
  clinicId: text('clinic_id').notNull().references(() => clinics.id, { onDelete: 'cascade' }),
  dentistId: text('dentist_id').notNull(), // User ID
  role: text('role').notNull(), // owner, admin, manager, dentist
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  uniqueMembership: index('clinic_memberships_unique_idx').on(table.clinicId, table.dentistId),
}));

export const clinicProvisioningRequests = pgTable('clinic_provisioning_requests', {
  id: text('id').primaryKey(), // UUID generated by app
  dentistId: text('dentist_id').notNull(),
  desiredName: text('desired_name'),
  seats: integer('seats'),
  planType: text('plan_type'),
  mode: text('mode'), // solo, team, multi
  status: text('status').default('draft'), // draft, checkout_created, paid, provisioned, failed
  stripeCheckoutSessionId: text('stripe_checkout_session_id').unique(),
  clerkOrganizationId: text('clerk_organization_id'), // Filled after provisioning
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const clinicLeadInvites = pgTable('clinic_lead_invites', {
  id: serial('id').primaryKey(),
  token: text('token').unique().notNull(),
  email: text('email'),
  createdByDentistId: text('created_by_dentist_id').notNull(),
  status: text('status').default('pending'), // pending, consumed
  createdAt: timestamp('created_at').defaultNow(),
  consumedAt: timestamp('consumed_at'),
});

export const subscriptions = pgTable('subscriptions', {
  id: serial('id').primaryKey(),
  // Polymorphic subscription (User OR Clinic)
  clinicId: text('clinic_id').references(() => clinics.id, { onDelete: 'cascade' }),
  userId: text('user_id'), // References Clerk ID (string)
  stripeCustomerId: text('stripe_customer_id').notNull(),
  stripeSubscriptionId: text('stripe_subscription_id').unique().notNull(),
  planType: text('plan_type').notNull(),
  status: text('status').notNull(), // active, past_due, canceled...
  currentPeriodEnd: timestamp('current_period_end'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// === End Clinic Provisioning ===

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

  // Audit fields (LGPD compliance)
  createdBy: text('created_by'),
  updatedBy: text('updated_by'),

  // Metadata
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  cancelledAt: timestamp('cancelled_at'),
  cancellationReason: text('cancellation_reason'),
}, (table) => ({
  // Performance indexes
  orgDateIdx: index('appointments_org_date_idx').on(table.organizationId, table.scheduledDate),
  patientIdx: index('appointments_patient_idx').on(table.patientId),
  dentistDateIdx: index('appointments_dentist_date_idx').on(table.dentistId, table.scheduledDate),
}));

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
export const patientsRelations = relations(patients, ({ one, many }) => ({
  address: one(addresses, {
    fields: [patients.addressId],
    references: [addresses.id],
  }),
  emergencyContacts: many(patientEmergencyContacts),
  insurances: many(patientInsurances),
  appointments: many(appointments),
  anamnesisResponses: many(anamnesisResponses),
}));

export const addressesRelations = relations(addresses, ({ many }) => ({
  patients: many(patients), // Technically 1:1 usually, but schema allows N
}));

export const patientEmergencyContactsRelations = relations(patientEmergencyContacts, ({ one }) => ({
  patient: one(patients, {
    fields: [patientEmergencyContacts.patientId],
    references: [patients.id],
  }),
}));

export const patientInsurancesRelations = relations(patientInsurances, ({ one }) => ({
  patient: one(patients, {
    fields: [patientInsurances.patientId],
    references: [patients.id],
  }),
}));

export const usersRelations = relations(users, ({ many }) => ({
  organizationMembers: many(organizationMembers),
}));

export const organizationsRelations = relations(organizations, ({ many }) => ({
  members: many(organizationMembers),
}));

export const organizationMembersRelations = relations(organizationMembers, ({ one }) => ({
  user: one(users, {
    fields: [organizationMembers.userId],
    references: [users.clerkId],
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
}, (table) => ({
  // Performance indexes for LGPD compliance queries
  orgCreatedIdx: index('audit_logs_org_created_idx').on(table.organizationId, table.createdAt),
  userActionIdx: index('audit_logs_user_action_idx').on(table.userId, table.action),
}));

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

  // Audit fields (LGPD compliance)
  createdBy: text('created_by'),
  updatedBy: text('updated_by'),

  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  // Performance indexes
  orgDateIdx: index('financials_org_date_idx').on(table.organizationId, table.date),
  orgTypeIdx: index('financials_org_type_idx').on(table.organizationId, table.type),
}));

// DEPRECATED - Migrating to 'encounters' and specific tables
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

// === PHASE 1: CLINICAL CORE ===

// 1. Encounters (Atendimentos SOAP)
export const encounters = pgTable('encounters', {
  id: serial('id').primaryKey(),
  organizationId: text('organization_id').notNull(),
  patientId: integer('patient_id').references(() => patients.id, { onDelete: 'cascade' }).notNull(),
  dentistId: text('dentist_id').notNull(),

  date: date('date').notNull().defaultNow(),
  startTime: time('start_time'),
  endTime: time('end_time'),
  type: text('type').default('consulta'), // consulta, retorno, urgencia, cirurgia

  // SOAP Fields
  subjective: text('subjective'), // Queixa principal / História
  objective: text('objective'),   // Exame físico
  assessment: text('assessment'), // Diagnóstico / Hipótese
  plan: text('plan'),             // Plano de tratamento / Conduta

  // Status & Security
  status: text('status').default('draft'), // draft, signed, locked
  signedAt: timestamp('signed_at'),
  signedBy: text('signed_by'),

  appointmentId: integer('appointment_id').references(() => appointments.id, { onDelete: 'set null' }),

  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  // Performance indexes for clinical record lookups
  patientDateIdx: index('encounters_patient_date_idx').on(table.patientId, table.date),
  orgDateIdx: index('encounters_org_date_idx').on(table.organizationId, table.date),
}));

// 2. Prescriptions (Receitas)
export const prescriptions = pgTable('prescriptions', {
  id: serial('id').primaryKey(),
  organizationId: text('organization_id').notNull(),
  encounterId: integer('encounter_id').references(() => encounters.id, { onDelete: 'cascade' }),
  patientId: integer('patient_id').references(() => patients.id, { onDelete: 'cascade' }).notNull(),
  dentistId: text('dentist_id').notNull(),

  // Structured Content
  medications: jsonb('medications').notNull(), // Array of { name, dosage, frequency, duration, route }
  instructions: text('instructions'),

  // PDF / Signature
  pdfUrl: text('pdf_url'),
  signatureToken: text('signature_token'),

  status: text('status').default('draft'), // draft, signed
  issuedAt: timestamp('issued_at'),

  createdAt: timestamp('created_at').defaultNow(),
});

// 3. Exam Orders (Pedidos de Exames)
export const examOrders = pgTable('exam_orders', {
  id: serial('id').primaryKey(),
  organizationId: text('organization_id').notNull(),
  encounterId: integer('encounter_id').references(() => encounters.id, { onDelete: 'cascade' }),
  patientId: integer('patient_id').references(() => patients.id, { onDelete: 'cascade' }).notNull(),
  dentistId: text('dentist_id').notNull(),

  type: text('type').notNull(), // laboratoriais, imagem, outros
  exams: jsonb('exams').notNull(), // List of exam names/codes
  justification: text('justification'),
  clinicalNotes: text('clinical_notes'),

  status: text('status').default('ordered'), // ordered, scheduled, completed, cancelled

  createdAt: timestamp('created_at').defaultNow(),
});

// 4. Documents Emitted (Atestados, Relatórios, Encaminhamentos)
export const documentsEmitted = pgTable('documents_emitted', {
  id: serial('id').primaryKey(),
  organizationId: text('organization_id').notNull(),
  encounterId: integer('encounter_id').references(() => encounters.id, { onDelete: 'cascade' }),
  patientId: integer('patient_id').references(() => patients.id, { onDelete: 'cascade' }).notNull(),
  dentistId: text('dentist_id').notNull(),

  type: text('type').notNull(), // atestado, relatorio, encaminhamento
  title: text('title').notNull(),
  content: text('content').notNull(), // HTML or Text content

  // Duration (for sick notes)
  daysOff: integer('days_off'),
  startDate: date('start_date'),
  cid: text('cid'),

  status: text('status').default('draft'), // draft, signed
  signedAt: timestamp('signed_at'),

  createdAt: timestamp('created_at').defaultNow(),
});

// === PHASE 2: SECURITY & QUALITY ===

// 5. Clinical Alerts (Alertas Clínicos & Alergias)
export const patientAlerts = pgTable('patient_alerts', {
  id: serial('id').primaryKey(),
  organizationId: text('organization_id').notNull(),
  patientId: integer('patient_id').references(() => patients.id, { onDelete: 'cascade' }).notNull(),

  type: text('type').notNull(), // 'allergy', 'condition', 'observation'
  severity: text('severity').default('low'), // 'low', 'medium', 'high'
  description: text('description').notNull(),

  active: boolean('active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  createdBy: text('created_by'), // userId
});

// 6. Consents (Consentimentos Informados)
export const patientConsents = pgTable('patient_consents', {
  id: serial('id').primaryKey(),
  organizationId: text('organization_id').notNull(),
  patientId: integer('patient_id').references(() => patients.id, { onDelete: 'cascade' }).notNull(),

  title: text('title').notNull(),
  content: text('content').notNull(), // HTML or Text of what was agreed

  signedAt: timestamp('signed_at').defaultNow(),
  signedByIp: text('signed_by_ip'),
  userAgent: text('user_agent'),

  revokedAt: timestamp('revoked_at'), // If the patient revokes consent

  createdAt: timestamp('created_at').defaultNow(),
});

// 7. Problem List (Lista de Problemas)
export const patientProblems = pgTable('patient_problems', {
  id: serial('id').primaryKey(),
  organizationId: text('organization_id').notNull(),
  patientId: integer('patient_id').references(() => patients.id, { onDelete: 'cascade' }).notNull(),

  code: text('code'), // CID-10, CIAP-2, etc. optional
  name: text('name').notNull(), // "Hypertension"

  status: text('status').default('active'), // 'active', 'resolved', 'inactive'
  diagnosedAt: date('diagnosed_at'),
  resolvedAt: date('resolved_at'),

  createdAt: timestamp('created_at').defaultNow(),
});

// 8. Continuous Medications (Medicações em Uso)
export const patientMedications = pgTable('patient_medications', {
  id: serial('id').primaryKey(),
  organizationId: text('organization_id').notNull(),
  patientId: integer('patient_id').references(() => patients.id, { onDelete: 'cascade' }).notNull(),

  name: text('name').notNull(),
  dosage: text('dosage'),
  frequency: text('frequency'),

  status: text('status').default('active'), // 'active', 'discontinued'
  startDate: date('start_date'),
  endDate: date('end_date'),

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
  patientId: integer('patient_id').notNull().references(() => patients.id, { onDelete: 'cascade' }),
  token: text('token').notNull().unique(),
  prefilledData: jsonb('prefilled_data'), // { name, email, phone, cpf }
  status: text('status').default('pending'), // 'pending', 'accepted', 'expired'
  expiresAt: timestamp('expires_at').notNull(),
  usedAt: timestamp('used_at'),
  createdBy: text('created_by').notNull(), // userId who created the invite
  createdAt: timestamp('created_at').defaultNow(),
});

export const patientInvitationsRelations = relations(patientInvitations, ({ one }) => ({
  patient: one(patients, {
    fields: [patientInvitations.patientId],
    references: [patients.id],
  }),
  organization: one(organizations, {
    fields: [patientInvitations.organizationId],
    references: [organizations.id],
  }),
}));


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
export const anamnesisTemplates = pgTable('anamnesis_templates', {
  id: serial('id').primaryKey(),
  organizationId: text('organization_id').notNull(),
  title: text('title').notNull(),
  description: text('description'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
});

export const anamnesisQuestions = pgTable('anamnesis_questions', {
  id: serial('id').primaryKey(),
  templateId: integer('template_id').references(() => anamnesisTemplates.id, { onDelete: 'cascade' }),
  section: text('section').notNull(), // 'General Health', 'Dental History', etc.
  text: text('text').notNull(),
  type: text('type').notNull(), // 'text', 'long_text', 'yes_no', 'multiple_choice', 'checkbox'
  options: jsonb('options'), // Array of strings for choices
  required: boolean('required').default(false),
  order: integer('order').notNull(),
  // Link specific questions to summary fields in patients table for auto-sync
  linkedField: text('linked_field'), // 'allergies', 'medications', 'medicalHistory'
});

export const anamnesisResponses = pgTable('anamnesis_responses', {
  id: serial('id').primaryKey(),
  patientId: integer('patient_id').references(() => patients.id, { onDelete: 'cascade' }),
  templateId: integer('template_id').references(() => anamnesisTemplates.id),
  answers: jsonb('answers'), // { [questionId]: value }
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const notificationPreferences = pgTable('notification_preferences', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull().unique(), // Link with Clerk ID

  // Email Channels
  emailAppointments: boolean('email_appointments').default(true),
  emailPayments: boolean('email_payments').default(true),
  emailMarketing: boolean('email_marketing').default(false),

  // Security
  securityAlerts: boolean('security_alerts').default(true),

  // Other Channels
  whatsappEnabled: boolean('whatsapp_enabled').default(false),
  pushEnabled: boolean('push_enabled').default(false),

  updatedAt: timestamp('updated_at').defaultNow(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const encountersRelations = relations(encounters, ({ one, many }) => ({
  patient: one(patients, {
    fields: [encounters.patientId],
    references: [patients.id],
  }),
  appointment: one(appointments, {
    fields: [encounters.appointmentId],
    references: [appointments.id],
  }),
  prescriptions: many(prescriptions),
  examOrders: many(examOrders),
  documentsEmitted: many(documentsEmitted),
  attachments: many(documents), // Reusing generic documents table as attachments for now
}));

export const prescriptionsRelations = relations(prescriptions, ({ one }) => ({
  encounter: one(encounters, {
    fields: [prescriptions.encounterId],
    references: [encounters.id],
  }),
  patient: one(patients, {
    fields: [prescriptions.patientId],
    references: [patients.id],
  }),
}));

export const examOrdersRelations = relations(examOrders, ({ one }) => ({
  encounter: one(encounters, {
    fields: [examOrders.encounterId],
    references: [encounters.id],
  }),
  patient: one(patients, {
    fields: [examOrders.patientId],
    references: [patients.id],
  }),
}));

export const documentsEmittedRelations = relations(documentsEmitted, ({ one }) => ({
  encounter: one(encounters, {
    fields: [documentsEmitted.encounterId],
    references: [encounters.id],
  }),
  patient: one(patients, {
    fields: [documentsEmitted.patientId],
    references: [patients.id],
  }),
}));

// === PHASE 3: ODONTOLOGY ADVANCED ===

export const odontogram = pgTable('odontogram', {
  id: serial('id').primaryKey(),
  organizationId: text('organization_id').notNull(),
  patientId: integer('patient_id').references(() => patients.id, { onDelete: 'cascade' }).notNull(),

  tooth: integer('tooth').notNull(), // FDI Number (11, 18, 21, etc.)
  surface: text('surface'), // 'distal', 'mesial', 'occlusal', 'lingual', 'buccal', 'root', 'whole'

  condition: text('condition').notNull(), // 'decay', 'restoration', 'missing', 'implant', 'crown', 'canal'
  material: text('material'), // 'resin', 'amalgam', 'porcelain'
  notes: text('notes'),

  status: text('status').default('current'), // 'current', 'planned', 'completed' (history)

  updatedAt: timestamp('updated_at').defaultNow(),
});

export const treatmentPlans = pgTable('treatment_plans', {
  id: serial('id').primaryKey(),
  organizationId: text('organization_id').notNull(),
  patientId: integer('patient_id').references(() => patients.id, { onDelete: 'cascade' }).notNull(),
  dentistId: text('dentist_id'),

  title: text('title').notNull(), // "Plano Reabilitação 2024"
  status: text('status').default('draft'), // draft, presented, approved, declined, completed

  totalCost: numeric('total_cost'),
  discount: numeric('discount'),
  finalPrice: numeric('final_price'),

  installments: integer('installments'),

  createdAt: timestamp('created_at').defaultNow(),
  expiresAt: timestamp('expires_at'),
});

export const planItems = pgTable('plan_items', {
  id: serial('id').primaryKey(),
  planId: integer('plan_id').references(() => treatmentPlans.id, { onDelete: 'cascade' }).notNull(),

  procedureId: integer('procedure_id').references(() => procedures.id),
  name: text('name').notNull(), // Snapshot of name

  tooth: integer('tooth'),
  surface: text('surface'),

  price: numeric('price').notNull(), // Snapshot of price
  quantity: integer('quantity').default(1),

  status: text('status').default('planned'), // planned, scheduled, prohibited, completed
});

export const treatmentPlansRelations = relations(treatmentPlans, ({ many }) => ({
  items: many(planItems),
}));

export const planItemsRelations = relations(planItems, ({ one }) => ({
  plan: one(treatmentPlans, {
    fields: [planItems.planId],
    references: [treatmentPlans.id],
  }),
  procedure: one(procedures, {
    fields: [planItems.procedureId],
    references: [procedures.id],
  }),
}));

// --- WAVE 0 FOUNDATION ---

// P2. Unified Timeline
export const timelineEvents = pgTable('timeline_events', {
  id: serial('id').primaryKey(),
  organizationId: text('organization_id').notNull(), // Tenant
  unitId: text('unit_id'), // Multi-unit support
  patientId: integer('patient_id'), // Optional, as some events might be system-wide or non-patient related

  eventType: text('event_type').notNull(), // 'clinical', 'financial', 'logistic', 'system'
  refType: text('ref_type').notNull(), // 'encounter', 'payment', 'shipment'
  refId: text('ref_id').notNull(), // ID of the referenced entity

  title: text('title').notNull(),
  summary: text('summary'),
  metadata: jsonb('metadata'), // Extra context

  createdAt: timestamp('created_at').defaultNow(),
  createdBy: text('created_by'), // User ID
});

// P4. Access Logs (Read-only Telemetry fo LGPD)
export const accessLogs = pgTable('access_logs', {
  id: serial('id').primaryKey(),
  organizationId: text('organization_id').notNull(),
  userId: text('user_id').notNull(),

  patientId: integer('patient_id'), // If accessing patient data

  action: text('action').notNull(), // 'VIEW', 'DOWNLOAD', 'SEARCH'
  resourceType: text('resource_type').notNull(), // 'patient_record', 'attachment', 'financial_report'
  resourceId: text('resource_id'),

  ip: text('ip'),
  userAgent: text('user_agent'),

  createdAt: timestamp('created_at').defaultNow(),
});

// Defining relations for new logs if necessary (usually they are standalone or loosly coupled)
export const timelineEventsRelations = relations(timelineEvents, ({ one }) => ({
  patient: one(patients, {
    fields: [timelineEvents.patientId],
    references: [patients.id],
  }),
}));

// P5. RBAC Granular & Unit Scopes
export const roles = pgTable('roles', {
  id: serial('id').primaryKey(),
  organizationId: text('organization_id').notNull(),
  name: text('name').notNull(), // 'admin', 'dentist_lead', 'receptionist'
  description: text('description'),
  isSystem: boolean('is_system').default(false), // If true, cannot be deleted
});

export const permissions = pgTable('permissions', {
  id: serial('id').primaryKey(),
  module: text('module').notNull(), // 'clinical', 'financial', 'schedule'
  action: text('action').notNull(), // 'view', 'edit', 'delete', 'sign'
  description: text('description'),
});

export const rolePermissions = pgTable('role_permissions', {
  id: serial('id').primaryKey(),
  roleId: integer('role_id').references(() => roles.id, { onDelete: 'cascade' }).notNull(),
  permissionId: integer('permission_id').references(() => permissions.id, { onDelete: 'cascade' }).notNull(),
});

export const userRoles = pgTable('user_roles', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull(), // Link to users table (Clerk ID or internal ID? Internal users.id is serial. We need consistency.)
  // Wait, users table has id: serial, clerkId: text. Most refs use patientId (int). 
  // Let's use internal ID (integer) for user relations if possible, but middleware uses clerkId often.
  // Checking existing schema: organization_members uses userId: text.
  // Let's stick to text to match organization_members for now to avoid migration pain, assuming it holds stringified ID or ClerkID.

  roleId: integer('role_id').references(() => roles.id, { onDelete: 'cascade' }).notNull(),
  organizationId: text('organization_id').notNull(),
});

export const userUnitScopes = pgTable('user_unit_scopes', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull(),
  organizationId: text('organization_id').notNull(),
  unitId: text('unit_id').notNull(), // The unit strictly allowed
});

export const rolesRelations = relations(roles, ({ many }) => ({
  permissions: many(rolePermissions),
}));

export const rolePermissionsRelations = relations(rolePermissions, ({ one }) => ({
  role: one(roles, { fields: [rolePermissions.roleId], references: [roles.id] }),
  permission: one(permissions, { fields: [rolePermissions.permissionId], references: [permissions.id] }),
}));

// P3. Attachment Links (Many-to-Many / Polymorphic)
export const attachmentLinks = pgTable('attachment_links', {
  id: serial('id').primaryKey(),
  organizationId: text('organization_id').notNull(),

  documentId: integer('document_id').references(() => documents.id, { onDelete: 'cascade' }).notNull(),

  refType: text('ref_type').notNull(), // 'encounter', 'lab_case', 'expense'
  refId: text('ref_id').notNull(),

  createdAt: timestamp('created_at').defaultNow(),
});

export const attachmentLinksRelations = relations(attachmentLinks, ({ one }) => ({
  document: one(documents, { fields: [attachmentLinks.documentId], references: [documents.id] }),
}));

// P1. Status Lock & Addendums (Immutable Corrections)
export const addendums = pgTable('addendums', {
  id: serial('id').primaryKey(),
  organizationId: text('organization_id').notNull(),

  refType: text('ref_type').notNull(), // 'encounter'
  refId: text('ref_id').notNull(),

  content: text('content').notNull(), // The correction text

  createdAt: timestamp('created_at').defaultNow(),
  createdBy: text('created_by').notNull(), // User ID
});

// WAVE 2: Lab & Logistics

export const labCases = pgTable('lab_cases', {
  id: serial('id').primaryKey(),
  organizationId: text('organization_id').notNull(),
  patientId: integer('patient_id').references(() => patients.id).notNull(),

  laboratoryName: text('laboratory_name').notNull(),
  type: text('type').notNull(), // 'prosthesis', 'guard', 'aligner'

  description: text('description'),

  status: text('status').default('planned'), // planned, sent, received, installed

  sentDate: timestamp('sent_date'),
  dueDate: timestamp('due_date'),
  receivedDate: timestamp('received_date'),

  price: numeric('price'),

  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});



export const labCasesRelations = relations(labCases, ({ one }) => ({
  patient: one(patients, {
    fields: [labCases.patientId],
    references: [patients.id],
  }),
}));

export const shipments = pgTable('shipments', {
  id: serial('id').primaryKey(),
  organizationId: text('organization_id').notNull(),

  trackingCode: text('tracking_code'),
  provider: text('provider'), // 'loggi', 'correios', 'driver'
  status: text('status').default('created'), // created, picked_up, delivered

  refType: text('ref_type'), // 'lab_case'
  refId: text('ref_id'),

  metadata: jsonb('metadata'), // Proof of delivery URL, driver name

  createdAt: timestamp('created_at').defaultNow(),
});

// Inventory W2.3 (Batches & Movements)
export const inventoryBatches = pgTable('inventory_batches', {
  id: serial('id').primaryKey(),
  organizationId: text('organization_id').notNull(),

  itemId: integer('item_id'), // Reference to existing inventory items if they exist
  batchNumber: text('batch_number').notNull(),
  expiryDate: timestamp('expiry_date').notNull(),

  quantity: integer('quantity').default(0),
  location: text('location'),
});

export const inventoryMovements = pgTable('inventory_movements', {
  id: serial('id').primaryKey(),
  organizationId: text('organization_id').notNull(),

  itemId: integer('item_id'),
  batchId: integer('batch_id').references(() => inventoryBatches.id),

  type: text('type').notNull(), // 'in', 'out', 'adjust', 'consume'
  quantity: integer('quantity').notNull(),

  refType: text('ref_type'), // 'encounter_procedure'
  refId: text('ref_id'),

  createdAt: timestamp('created_at').defaultNow(),
  createdBy: text('created_by'),
});

// WAVE 3: Finance Core (Ledger)

export const financialLedger = pgTable('financial_ledger', {
  id: serial('id').primaryKey(),
  organizationId: text('organization_id').notNull(),

  transactionDate: timestamp('transaction_date').notNull(),
  amount: numeric('amount').notNull(), // Signed? Or use type? Usually signed decimal.
  type: text('type').notNull(), // 'CREDIT' | 'DEBIT'

  category: text('category').notNull(), // 'payment', 'expense', 'refund'
  description: text('description').notNull(),

  refType: text('ref_type'), // 'appointment', 'lab_case'
  refId: text('ref_id'),

  balanceAfter: numeric('balance_after'), // Running balance snapshot

  createdAt: timestamp('created_at').defaultNow(),
  createdBy: text('created_by'), // User ID
});

export const accountsReceivable = pgTable('accounts_receivable', {
  id: serial('id').primaryKey(),
  organizationId: text('organization_id').notNull(),
  patientId: integer('patient_id').references(() => patients.id).notNull(),

  amount: numeric('amount').notNull(),
  dueDate: timestamp('due_date').notNull(),

  status: text('status').default('open'), // open, paid, overdue, canceled

  description: text('description'),
  ledgerId: integer('ledger_id').references(() => financialLedger.id), // Link when paid

  createdAt: timestamp('created_at').defaultNow(),
});

// WAVE 3.1: Automation Playbooks
export const automationRules = pgTable('automation_rules', {
  id: serial('id').primaryKey(),
  organizationId: text('organization_id').notNull(),
  name: text('name').notNull(),
  isActive: boolean('is_active').default(true),

  triggerType: text('trigger_type').notNull(), // 'appointment_status', 'inventory_low', 'birthday'
  triggerConfig: jsonb('trigger_config'), // { status: 'missed', time_offset: 60 }

  actionType: text('action_type').notNull(), // 'send_whatsapp', 'send_email', 'create_task'
  actionConfig: jsonb('action_config'), // { template: 'missed_appt_pt', task_title: 'Call Patient' }

  createdAt: timestamp('created_at').defaultNow(),
  lastRunAt: timestamp('last_run_at'),
});

export const automationLogs = pgTable('automation_logs', {
  id: serial('id').primaryKey(),
  organizationId: text('organization_id').notNull(),
  ruleId: integer('rule_id').references(() => automationRules.id, { onDelete: 'cascade' }),

  status: text('status').notNull(), // 'success', 'failed'
  details: text('details'),

  refType: text('ref_type'), // 'appointment'
  refId: text('ref_id'),

  executedAt: timestamp('executed_at').defaultNow(),
});

export const whatsappAutomationRules = pgTable('whatsapp_automation_rules', {
  id: serial('id').primaryKey(),
  ownerType: text('owner_type').notNull(), // 'clinic' | 'dentist'
  ownerId: text('owner_id').notNull(),
  type: text('type').notNull(), // 'confirmation', 'reminder', 'birthday', etc.
  enabled: boolean('enabled').default(false),
  scheduleOffsetMinutes: integer('schedule_offset_minutes').default(0), // e.g. -1440 for 24h before
  template: text('template'),
  channel: text('channel').default('whatsapp'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const whatsappMessageTemplates = pgTable('whatsapp_message_templates', {
  id: serial('id').primaryKey(),
  ownerType: text('owner_type').notNull(),
  ownerId: text('owner_id').notNull(),
  name: text('name').notNull(),
  template: text('template').notNull(),
  variables: jsonb('variables'), // e.g. ['name', 'date']
  createdAt: timestamp('created_at').defaultNow(),
});

export const whatsappCampaigns = pgTable('whatsapp_campaigns', {
  id: serial('id').primaryKey(),
  ownerType: text('owner_type').notNull(),
  ownerId: text('owner_id').notNull(),
  name: text('name').notNull(),
  objective: text('objective'),
  status: text('status').default('draft'), // draft, scheduled, sent
  audienceQuery: jsonb('audience_query'),
  messages: jsonb('messages'),
  scheduledAt: timestamp('scheduled_at'),
  sentAt: timestamp('sent_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const dentistClinicContracts = pgTable('dentist_clinic_contracts', {
  id: serial('id').primaryKey(),
  organizationId: text('organization_id').notNull(), // The Clinic
  dentistId: text('dentist_id').notNull(), // The Dentist (User ID)
  role: text('role').default('dentist'), // partner, associate, etc.

  commissionRate: numeric('commission_rate'), // e.g. 0.40 for 40%
  fixedSalary: numeric('fixed_salary'),

  startDate: date('start_date').defaultNow(),
  endDate: date('end_date'),

  status: text('status').default('active'), // active, terminated
  contractUrl: text('contract_url'), // PDF link

  createdAt: timestamp('created_at').defaultNow(),
});

// === AI ASSISTANT ===

export const aiConversations = pgTable('ai_conversations', {
  id: serial('id').primaryKey(),
  organizationId: text('organization_id').notNull(),
  userId: text('user_id').notNull(),
  title: text('title').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const aiMessages = pgTable('ai_messages', {
  id: serial('id').primaryKey(),
  conversationId: integer('conversation_id').references(() => aiConversations.id, { onDelete: 'cascade' }),
  role: text('role').notNull(), // 'user' | 'assistant' | 'system'
  content: text('content').notNull(),
  metadata: jsonb('metadata'), // Context info, tool calls, etc.
  createdAt: timestamp('created_at').defaultNow(),
});

export const aiConversationsRelations = relations(aiConversations, ({ many }) => ({
  messages: many(aiMessages),
}));

export const aiMessagesRelations = relations(aiMessages, ({ one }) => ({
  conversation: one(aiConversations, {
    fields: [aiMessages.conversationId],
    references: [aiConversations.id],
  }),
}));

// === USAGE TRACKING (Cost Control) ===

export const aiUsage = pgTable('ai_usage', {
  id: serial('id').primaryKey(),
  organizationId: text('organization_id').notNull(),
  userId: text('user_id').notNull(),
  date: date('date').notNull().defaultNow(),
  tokensUsed: integer('tokens_used').default(0),
  requestCount: integer('request_count').default(0),
  estimatedCost: numeric('estimated_cost', { precision: 10, scale: 4 }).default('0'), // USD
  model: text('model'), // e.g., 'gpt-4', 'gpt-3.5-turbo'
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  // Performance indexes for quota queries
  orgDateIdx: index('ai_usage_org_date_idx').on(table.organizationId, table.date),
  userDateIdx: index('ai_usage_user_date_idx').on(table.userId, table.date),
}));

export const whatsappUsage = pgTable('whatsapp_usage', {
  id: serial('id').primaryKey(),
  organizationId: text('organization_id').notNull(),
  userId: text('user_id').notNull(),
  date: date('date').notNull().defaultNow(),
  messagesSent: integer('messages_sent').default(0),
  estimatedCost: numeric('estimated_cost', { precision: 10, scale: 4 }).default('0'), // USD
  campaignId: integer('campaign_id'), // Optional link to campaign
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  // Performance indexes for quota queries
  orgDateIdx: index('whatsapp_usage_org_date_idx').on(table.organizationId, table.date),
  userDateIdx: index('whatsapp_usage_user_date_idx').on(table.userId, table.date),
}));

// === PHASE 4: BILLING (ASAAS INTEGRATION) ===

export const billingCustomers = pgTable('billing_customers', {
  id: serial('id').primaryKey(),
  organizationId: text('organization_id').notNull(),
  patientId: integer('patient_id').references(() => patients.id, { onDelete: 'cascade' }),
  asaasCustomerId: text('asaas_customer_id').notNull().unique(),

  // Cache of synced data
  name: text('name'),
  cpfCnpj: text('cpf_cnpj'),
  email: text('email'),

  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const billingCharges = pgTable('billing_charges', {
  id: text('id').primaryKey(), // UUID generated internally
  organizationId: text('organization_id').notNull(),

  ownerType: text('owner_type').notNull().default('clinic'), // 'clinic' or 'dentist' (autonomo)
  ownerId: text('owner_id').notNull(), // organizationId or dentistId

  patientId: integer('patient_id').references(() => patients.id, { onDelete: 'set null' }),
  billingCustomerId: integer('billing_customer_id').references(() => billingCustomers.id),

  // Context
  appointmentId: integer('appointment_id').references(() => appointments.id, { onDelete: 'set null' }),
  // procedures linkage via separate table if many-to-many, or just simple ref here

  // Financials
  amount: numeric('amount').notNull(),
  netAmount: numeric('net_amount'), // After fees

  discount: numeric('discount'),
  interest: numeric('interest'),
  fine: numeric('fine'),

  // Asaas Info
  asaasPaymentId: text('asaas_payment_id').unique(), // The ID returned by Asaas
  asaasInstallmentId: text('asaas_installment_id'),

  method: text('method').notNull(), // PIX, BOLETO, CREDIT_CARD, CREDIT_CARD_ID
  status: text('status').notNull(), // PENDING, FLAGGED, RECEIVED, OVERDUE, REFUNDED

  dueDate: date('due_date').notNull(),
  originalDueDate: date('original_due_date'),

  // Payment URLs
  invoiceUrl: text('invoice_url'),
  bankSlipUrl: text('bank_slip_url'),
  pixQrCodePayload: text('pix_qr_code_payload'),
  pixQrCodeImage: text('pix_qr_code_image'), // Base64

  description: text('description'),

  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  paidAt: timestamp('paid_at'),
});

export const billingWebhookEvents = pgTable('billing_webhook_events', {
  id: serial('id').primaryKey(),
  provider: text('provider').default('asaas'),
  eventId: text('event_id').unique(), // Asaas event ID
  eventType: text('event_type').notNull(), // PAYMENT_RECEIVED, etc.
  payload: jsonb('payload').notNull(),
  processedAt: timestamp('processed_at'),
  status: text('status').default('pending'), // pending, processed, failed
  error: text('error'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Relations
export const billingCustomersRelations = relations(billingCustomers, ({ one, many }) => ({
  patient: one(patients, {
    fields: [billingCustomers.patientId],
    references: [patients.id]
  }),
  charges: many(billingCharges)
}));

export const billingChargesRelations = relations(billingCharges, ({ one }) => ({
  patient: one(patients, {
    fields: [billingCharges.patientId],
    references: [patients.id]
  }),
  customer: one(billingCustomers, {
    fields: [billingCharges.billingCustomerId],
    references: [billingCustomers.id]
  }),
  appointment: one(appointments, {
    fields: [billingCharges.appointmentId],
    references: [appointments.id]
  })
}));

export const payments = pgTable('payments', {
  id: text('id').primaryKey(), // uuid
  organizationId: text('organization_id').notNull(),
  patientId: integer('patient_id').references(() => patients.id, { onDelete: 'set null' }),
  appointmentId: integer('appointment_id').references(() => appointments.id, { onDelete: 'set null' }),

  amount: numeric('amount').notNull(),
  currency: text('currency').default('brl').notNull(),
  status: text('status').notNull(), // pending, succeeded, failed, refunded

  stripeConnectedAccountId: text('stripe_connected_account_id').notNull(),
  stripeCheckoutSessionId: text('stripe_checkout_session_id').unique(),
  stripePaymentIntentId: text('stripe_payment_intent_id').unique(),

  description: text('description'),
  metadata: jsonb('metadata'),

  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// === CYCLE 3: CPF CORRECTION FLOW ===

export const cpfCorrectionRequests = pgTable('cpf_correction_requests', {
  id: serial('id').primaryKey(),
  organizationId: text('organization_id').notNull(),
  patientId: integer('patient_id').notNull().references(() => patients.id, { onDelete: 'cascade' }),
  requestedBy: text('requested_by').notNull(), // clerkId of the requester
  oldCpf: text('old_cpf'),
  newCpf: text('new_cpf').notNull(),
  reason: text('reason').notNull(),
  status: text('status').notNull().default('pending'), // 'pending', 'approved', 'rejected'
  reviewedBy: text('reviewed_by'), // clerkId of the reviewer
  reviewedAt: timestamp('reviewed_at'),
  rejectionReason: text('rejection_reason'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const cpfCorrectionRequestsRelations = relations(cpfCorrectionRequests, ({ one }) => ({
  patient: one(patients, {
    fields: [cpfCorrectionRequests.patientId],
    references: [patients.id],
  }),
}));

