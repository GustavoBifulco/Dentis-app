import { pgTable, serial, text, integer, decimal, timestamp, boolean } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  clerkId: text('clerk_id').unique().notNull(),
  role: text('role').notNull(),
  onboardingComplete: boolean('onboarding_complete').default(false),
});

export const inventory = pgTable('inventory', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  category: text('category').notNull(),
  quantity: integer('quantity').notNull().default(0),
  unit: text('unit').notNull(),
  minLevel: integer('min_level').notNull().default(5),
  userId: text('user_id').notNull(), // Forçando o nome da coluna no banco
});

export const procedures = pgTable('procedures', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  code: text('code'),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  cost: decimal('cost', { precision: 10, scale: 2 }).default('0.00'),
  duration: integer('duration').notNull(),
  category: text('category'),
  userId: text('user_id').notNull(), // Forçando o nome da coluna no banco
});

export const patients = pgTable('patients', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email'),
  phone: text('phone'),
  cpf: text('cpf'),
  userId: text('user_id').notNull(),
});
