import { and, count, eq, gt, gte, sum } from 'drizzle-orm';
import { db } from '@/libs/DB';
import { Env } from '@/libs/Env';
import { generationSchema, paymentSchema, subscriptionSchema } from '@/models/Schema';

export type AdminStats = {
  imagesLast30d: number;
  tokensLast30d: number;
  activeSubscriptions: { plan: string; count: number }[];
  revenueLast30dCents: number;
};

const DAY_MS = 86_400_000;

export const isAdminEmail = (email: string | undefined) => {
  if (!email || !Env.ADMIN_EMAILS) {
    return false;
  }
  const admins = Env.ADMIN_EMAILS.split(',').map(e => e.trim().toLowerCase()).filter(Boolean);
  return admins.includes(email.toLowerCase());
};

export const getAdminStats = async (): Promise<AdminStats> => {
  const since = new Date(Date.now() - 30 * DAY_MS);

  const [usage, subs, revenue] = await Promise.all([
    db
      .select({ type: generationSchema.type, count: count(), tokens: sum(generationSchema.tokens) })
      .from(generationSchema)
      .where(gte(generationSchema.createdAt, since))
      .groupBy(generationSchema.type),
    db
      .select({ plan: subscriptionSchema.plan, count: count() })
      .from(subscriptionSchema)
      .where(and(eq(subscriptionSchema.isPro, true), gt(subscriptionSchema.proUntil, new Date())))
      .groupBy(subscriptionSchema.plan),
    db
      .select({ total: sum(paymentSchema.amountCents) })
      .from(paymentSchema)
      .where(and(eq(paymentSchema.status, 'APPROVED'), gte(paymentSchema.createdAt, since))),
  ]);

  return {
    imagesLast30d: usage.find(r => r.type === 'image')?.count ?? 0,
    tokensLast30d: Number(usage.find(r => r.type === 'text')?.tokens ?? 0),
    activeSubscriptions: subs.map(s => ({ plan: s.plan, count: s.count })),
    revenueLast30dCents: Number(revenue[0]?.total ?? 0),
  };
};
