import { boolean, index, integer, jsonb, pgEnum, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

// This file defines the structure of your database tables using the Drizzle ORM.
// After editing it, generate a migration with `npm run db:generate`.

export const paymentStatusEnum = pgEnum('payment_status', [
  'PENDING',
  'APPROVED',
  'CANCELLED',
  'REJECTED',
  'ERROR',
]);

export const generationTypeEnum = pgEnum('generation_type', ['text', 'image']);

export const planEnum = pgEnum('plan', ['free', 'premium', 'vip']);

/** One row per successful Venice generation; drives monthly quotas and rate limits. */
export const generationSchema = pgTable('generations', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull(),
  type: generationTypeEnum('type').notNull(),
  tokens: integer('tokens').default(0).notNull(),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
}, table => [index('generations_user_created_idx').on(table.userId, table.createdAt)]);

/** Paid plan per Clerk user; users without a row (or with an expired period) are on the free plan. */
export const subscriptionSchema = pgTable('subscriptions', {
  userId: text('user_id').primaryKey(),
  isPro: boolean('is_pro').default(false).notNull(),
  plan: planEnum('plan').default('free').notNull(),
  proUntil: timestamp('pro_until', { mode: 'date' }),
  updatedAt: timestamp('updated_at', { mode: 'date' })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
});

/** PayPhone payment attempts. */
export const paymentSchema = pgTable('payments', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull(),
  clientTransactionId: text('client_transaction_id').notNull().unique(),
  payphoneTransactionId: text('payphone_transaction_id'),
  plan: planEnum('plan').default('premium').notNull(),
  amountCents: integer('amount_cents').notNull(),
  currency: text('currency').default('USD').notNull(),
  status: paymentStatusEnum('status').default('PENDING').notNull(),
  rawResponse: jsonb('raw_response'),
  updatedAt: timestamp('updated_at', { mode: 'date' })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
});
