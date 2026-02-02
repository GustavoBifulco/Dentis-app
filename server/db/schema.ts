import { pgTable, serial, text, integer, decimal, timestamp, boolean, date, json, real } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// --- ENUMS SIMULATED (TEXT) ---
// OrganizationType: 'CLINIC', 'LAB', 'RADIOLOGY'
// OrganizationStatus: 'ACTIVE', 'PENDING', 'SHADOW'
// OrderStatus: 'PENDING', 'CONFIRMED', 'SENT', 'RECEIVED', 'IN_PRODUCTION', 'READY_FOR_PICKUP', 'IN_TRANSIT', 'DELIVERED', 'COMPLETED'
// PaymentStatus: 'PENDING', 'AUTHORIZED', 'PAID', 'FAILED'
// PayoutStatus: 'SCHEDULED', 'PAID', 'Processing'

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  clerkId: text('clerk_id').unique().notNull(),
  email: text('email'),
  name: text('name'),
  surname: text('surname'),
  role: text('role').notNull(), // dentist, clinic_owner, patient, lab_admin, lab_tech, courier
  avatarUrl: text('avatar_url'),
  isActive: boolean('is_active').default(true),
  onboardingComplete: boolean('onboarding_complete').default(false),
  profileData: json('profile_data'), // Address, BirthDate, etc.
});

// "Clinics" is now "Organizations"
export const clinics = pgTable('clinics', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  type: text('type').notNull().default('CLINIC'), // CLINIC, LAB, RADIOLOGY
  status: text('status').notNull().default('ACTIVE'), // ACTIVE, PENDING, SHADOW
  address: text('address'),
  phone: text('phone'),
  cnpj: text('cnpj'),
  kioskToken: text('kiosk_token'),
  clerkOrgId: text('clerk_org_id'),
  allowedModules: json('allowed_modules').$type<string[]>().default(['LABS', 'MARKETPLACE']),

  // Geolocation for Logistics
  latitude: decimal('latitude', { precision: 10, scale: 7 }),
  longitude: decimal('longitude', { precision: 10, scale: 7 }),

  // Financial
  walletBalance: decimal('wallet_balance', { precision: 12, scale: 2 }).default('0.00'),
  stripeAccountId: text('stripe_account_id'),
});

export const clinicMembers = pgTable('clinic_members', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  clinicId: integer('clinic_id').references(() => clinics.id).notNull(),
  role: text('role').notNull(), // OWNER, ADMIN, DENTIST, RECEPTIONIST, LAB_ADMIN, LAB_TECH
});

// --- CATALOG (LAB MENU) ---
export const catalogItems = pgTable('catalog_items', {
  id: serial('id').primaryKey(),
  organizationId: integer('organization_id').references(() => clinics.id).notNull(),
  name: text('name').notNull(),
  description: text('description'),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  productionDays: integer('production_days').notNull().default(3), // SLA
  category: text('category'), // Protese Fixa, Removivel, Ortodontia
  isActive: boolean('is_active').default(true),
});

// --- LOGISTICS ---
export const couriers = pgTable('couriers', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  vehicleType: text('vehicle_type'), // MOTO, CAR, BIKE
  plate: text('plate'),
  currentLat: decimal('current_lat', { precision: 10, scale: 7 }),
  currentLng: decimal('current_lng', { precision: 10, scale: 7 }),
  isOnline: boolean('is_online').default(false),
  lastUpdate: timestamp('last_update'),
});

// --- VIRAL LOOP ---
export const invites = pgTable('invites', {
  id: serial('id').primaryKey(),
  token: text('token').unique().notNull(),
  inviterClinicId: integer('inviter_clinic_id').references(() => clinics.id).notNull(),
  inviterUserId: integer('inviter_user_id').references(() => users.id).notNull(),
  invitedName: text('invited_name').notNull(),
  invitedPhone: text('invited_phone').notNull(), // WhatsApp
  targetOrganizationId: integer('target_organization_id').references(() => clinics.id), // The Shadow Lab
  status: text('status').notNull().default('PENDING'), // PENDING, ACCEPTED, EXPIRED
  createdAt: timestamp('created_at').defaultNow(),
  expiresAt: timestamp('expires_at'),
});

// --- REVIEWS ---
export const reviews = pgTable('reviews', {
  id: serial('id').primaryKey(),
  orderId: integer('order_id'), // Linked later due to circular dep definition (will resolve in relations or just integer)
  reviewerId: integer('reviewer_id').references(() => users.id).notNull(),
  targetId: integer('target_id').references(() => clinics.id).notNull(), // Organization being reviewed
  rating: integer('rating').notNull(), // 1-5
  comment: text('comment'),
  createdAt: timestamp('created_at').defaultNow(),
});

// --- ORDERS (Updated) ---
export const orders = pgTable('orders', {
  id: serial('id').primaryKey(),
  clinicId: integer('clinic_id').references(() => clinics.id).notNull(), // REQUESTER
  dentistId: integer('dentist_id').references(() => users.id).notNull(),
  patientId: integer('patient_id').references(() => patients.id),
  appointmentId: integer('appointment_id').references(() => appointments.id),

  // Provider Info
  labId: integer('lab_id').references(() => clinics.id), // PROVIDER (can be null if external?) - Now linked to Organization
  catalogItemId: integer('catalog_item_id').references(() => catalogItems.id),

  labName: text('lab_name'), // Fallback for legacy or text-only orders
  description: text('description').notNull(),

  // Financials
  price: decimal('price', { precision: 10, scale: 2 }).default('0.00'), // Total User Pays
  subtotal: decimal('subtotal', { precision: 10, scale: 2 }).default('0.00'), // Lab Gets
  platformFee: decimal('platform_fee', { precision: 10, scale: 2 }).default('0.00'), // Dentis Gets
  deliveryFee: decimal('delivery_fee', { precision: 10, scale: 2 }).default('0.00'), // Courier Gets

  paymentStatus: text('payment_status').default('PENDING'), // PENDING, AUTHORIZED, PAID
  transactionId: text('transaction_id'),
  payoutStatus: text('payout_status').default('SCHEDULED'),

  // Status & Logistics
  status: text('status').notNull(), // PENDING, CONFIRMED, IN_PRODUCTION, READY, IN_TRANSIT, DELIVERED
  courierId: integer('courier_id').references(() => couriers.id),
  pickupCode: text('pickup_code'),
  deliveryCode: text('delivery_code'),
  trackingUrl: text('tracking_url'),

  createdAt: timestamp('created_at').defaultNow(),
  deadline: timestamp('deadline'),
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
  duration: integer('duration').notNull(),
  durationMinutes: integer('duration_minutes'),
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
  status: text('status').notNull(),
  notes: text('notes'),
});

export const financial = pgTable('financial', {
  id: serial('id').primaryKey(),
  clinicId: integer('clinic_id').references(() => clinics.id).notNull(),
  patientId: integer('patient_id').references(() => patients.id),
  appointmentId: integer('appointment_id').references(() => appointments.id),
  userId: integer('user_id').references(() => users.id),
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
  teeth: text('teeth'),
  type: text('type').notNull(),
  data: json('data'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const campaigns = pgTable('campaigns', {
  id: serial('id').primaryKey(),
  clinicId: integer('clinic_id').references(() => clinics.id).notNull(),
  creatorId: integer('creator_id').references(() => users.id).notNull(),
  name: text('name').notNull(),
  status: text('status').notNull(),
  type: text('type').notNull(),
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
  status: text('status').notNull(),
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

// --- RELATIONS ---

export const usersRelations = relations(users, ({ many }) => ({
  clinicMembers: many(clinicMembers),
  orders: many(orders),
  financialRecords: many(financial),
  reviewsWritten: many(reviews, { relationName: 'reviewer' }),
}));

export const clinicsRelations = relations(clinics, ({ many }) => ({
  members: many(clinicMembers),
  patients: many(patients),
  appointments: many(appointments),
  procedures: many(procedures),
  inventory: many(inventory),
  financial: many(financial),
  ordersAsRequester: many(orders, { relationName: 'clinicOrders' }),
  ordersAsProvider: many(orders, { relationName: 'labOrders' }),
  catalogItems: many(catalogItems),
  reviewsReceived: many(reviews, { relationName: 'targetClinic' }),
}));

export const clinicMembersRelations = relations(clinicMembers, ({ one }) => ({
  user: one(users, { fields: [clinicMembers.userId], references: [users.id] }),
  clinic: one(clinics, { fields: [clinicMembers.clinicId], references: [clinics.id] }),
}));

export const appointmentsRelations = relations(appointments, ({ one, many }) => ({
  patient: one(patients, { fields: [appointments.patientId], references: [patients.id] }),
  dentist: one(users, { fields: [appointments.dentistId], references: [users.id] }),
  orders: many(orders),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  clinic: one(clinics, { fields: [orders.clinicId], references: [clinics.id], relationName: 'clinicOrders' }),
  lab: one(clinics, { fields: [orders.labId], references: [clinics.id], relationName: 'labOrders' }),
  dentist: one(users, { fields: [orders.dentistId], references: [users.id] }),
  patient: one(patients, { fields: [orders.patientId], references: [patients.id] }),
  appointment: one(appointments, { fields: [orders.appointmentId], references: [appointments.id] }),
  courier: one(couriers, { fields: [orders.courierId], references: [couriers.id] }),
  catalogItem: one(catalogItems, { fields: [orders.catalogItemId], references: [catalogItems.id] }),
}));

export const couriersRelations = relations(couriers, ({ one, many }) => ({
  user: one(users, { fields: [couriers.userId], references: [users.id] }), // Relation to User
  deliveries: many(orders),
}));

export const catalogItemsRelations = relations(catalogItems, ({ one }) => ({
  organization: one(clinics, { fields: [catalogItems.organizationId], references: [clinics.id] }),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  reviewer: one(users, { fields: [reviews.reviewerId], references: [users.id], relationName: 'reviewer' }),
  target: one(clinics, { fields: [reviews.targetId], references: [clinics.id], relationName: 'targetClinic' }),
  // Order relation can be tricky if not defined in schema (it is defined as integer).
  // We can add it if needed: order: one(orders, { fields: [reviews.orderId], references: [orders.id]} )
}));

export const campaignsRelations = relations(campaigns, ({ one, many }) => ({
  creator: one(users, { fields: [campaigns.creatorId], references: [users.id] }),
  logs: many(messageLogs),
}));

export const messageLogsRelations = relations(messageLogs, ({ one }) => ({
  campaign: one(campaigns, { fields: [messageLogs.campaignId], references: [campaigns.id] }),
  patient: one(patients, { fields: [messageLogs.patientId], references: [patients.id] }),
}));

export const financialRelations = relations(financial, ({ one }) => ({
  clinic: one(clinics, { fields: [financial.clinicId], references: [clinics.id] }),
  user: one(users, { fields: [financial.userId], references: [users.id] }),
}));
