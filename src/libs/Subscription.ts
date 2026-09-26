import type { PaidPlanName, UserSubscription } from '@/types/Subscription';
import { eq } from 'drizzle-orm';
import { db } from '@/libs/DB';
import { subscriptionSchema } from '@/models/Schema';
import { isPaidPlan, PLAN_NAME, PlansByName } from '@/utils/PricingPlans';

const DAY_MS = 86_400_000;

/** Returns the effective plan of a user (expired paid periods count as free). */
export const getUserSubscription = async (userId: string): Promise<UserSubscription> => {
  const row = await db.query.subscriptionSchema.findFirst({
    where: eq(subscriptionSchema.userId, userId),
  });

  if (!row) {
    return { plan: PLAN_NAME.FREE, isPaid: false, paidUntil: null };
  }

  const active = row.isPro && isPaidPlan(row.plan) && (!row.proUntil || row.proUntil.getTime() > Date.now());

  return {
    plan: active ? row.plan : PLAN_NAME.FREE,
    isPaid: active,
    paidUntil: row.proUntil,
  };
};

/**
 * Grants a paid plan for one plan duration. Paying for the same plan stacks on the
 * remaining time; buying a different plan switches to it and also keeps the remaining days.
 */
export const grantPlan = async (userId: string, plan: PaidPlanName) => {
  const current = await getUserSubscription(userId);
  const base = current.isPaid && current.paidUntil ? current.paidUntil.getTime() : Date.now();
  const proUntil = new Date(base + PlansByName[plan].durationDays * DAY_MS);

  await db
    .insert(subscriptionSchema)
    .values({ userId, isPro: true, plan, proUntil })
    .onConflictDoUpdate({
      target: subscriptionSchema.userId,
      set: { isPro: true, plan, proUntil },
    });

  return proUntil;
};
