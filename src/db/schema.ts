import { sql } from 'drizzle-orm'
import { integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const transactions = sqliteTable('transactions', {
  id: text('id').primaryKey(),
  card: text('card').notNull(), // 'csp' | 'amex_gold' | 'amex_platinum' | 'venture_x'
  date: text('date').notNull(),
  merchant: text('merchant').notNull(),
  amount: real('amount').notNull(),
  category: text('category').notNull(),
  pointsEarned: real('points_earned').notNull().default(0),
  multiplier: real('multiplier').notNull().default(1),
  notes: text('notes'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
})

export const benefits = sqliteTable('benefits', {
  id: text('id').primaryKey(),
  card: text('card').notNull(),
  name: text('name').notNull(),
  totalAmount: real('total_amount').notNull(),
  usedAmount: real('used_amount').notNull().default(0),
  cadence: text('cadence').notNull(), // 'annual' | 'monthly' | 'semi_annual'
  resetMonth: integer('reset_month'), // null = Dec 31, number = specific month
  periodKey: text('period_key').notNull(), // e.g. '2026' or '2026-03'
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
})

export type Transaction = typeof transactions.$inferSelect
export type NewTransaction = typeof transactions.$inferInsert
export type Benefit = typeof benefits.$inferSelect
export type NewBenefit = typeof benefits.$inferInsert
