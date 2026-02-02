import { pgTable, serial, text, integer, boolean, timestamp, decimal } from 'drizzle-orm/pg-core';

export const labOrders = pgTable('lab_orders', {
  id: serial('id').primaryKey(),
  clinicId: text('clinic_id').notNull(),
  patientName: text('patient_name').notNull(),
  procedure: text('procedure').notNull(),
  labName: text('lab_name'),
  status: text('status', { enum: ['requested', 'production', 'ready', 'delivered'] }).default('requested'),
  deadline: timestamp('deadline').notNull(),
  cost: decimal('cost', { precision: 10, scale: 2 }).default('0'),
  isDigital: boolean('is_digital').default(false),
  stlFileUrl: text('stl_file_url'),
  createdAt: timestamp('created_at').defaultNow()
});