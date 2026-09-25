import type { UserSubscription } from '@/types/Subscription';
import { eq } from 'drizzle-orm';
import { db } from '@/libs/DB';
import { subscriptionSchema } from '@/models/Schema';
import { ProPlan } from '@/utils/PricingPlans';

const DAY_MS = 86_400_000;

/** Returns the effective PRO state of a user (expired periods count as free). */
export const getUserSubscription = async (userId: string): Promise<UserSubscription> => {
  const row = await db.query.subscriptionSchema.findFirst({
    where: eq(subscriptionSchema.userId, userId),
  });

  if (!row) {
    return { isPro: false, proUntil: null };
  }

  const isPro = row.isPro && (!row.proUntil || row.proUntil.getTime() > Date.now());

  return { isPro, proUntil: row.proUntil };
};

/** Extends the user's PRO period by one plan duration, stacking on any remaining time. */
export const grantPro = async (userId: string) => {
  const current = await getUserSubscription(userId);
  const base = current.isPro && current.proUntil ? current.proUntil.getTime() : Date.now();
  const proUntil = new Date(base + ProPlan.durationDays * DAY_MS);

  await db
    .insert(subscriptionSchema)
    .values({ userId, isPro: true, proUntil })
    .onConflictDoUpdate({
      target: subscriptionSchema.userId,
      set: { isPro: true, proUntil },
    });

  return proUntil;
};
