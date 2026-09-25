import { boolean, integer, jsonb, pgEnum, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

// This file defines the structure of your database tables using the Drizzle ORM.
// After editing it, generate a migration with `npm run db:generate`.

export const paymentStatusEnum = pgEnum('payment_status', [
  'PENDING',
  'APPROVED',
  'CANCELLED',
  'REJECTED',
  'ERROR',
]);

/** PRO access per Clerk user. */
export const subscriptionSchema = pgTable('subscriptions', {
  userId: text('user_id').primaryKey(),
  isPro: boolean('is_pro').default(false).notNull(),
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
