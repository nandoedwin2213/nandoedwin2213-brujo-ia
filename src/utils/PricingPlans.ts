import type { PaidPlanName, PlanLimits, PlanName, PricingPlan } from '@/types/Subscription';

/** Pricing plans */
export const PLAN_NAME = {
  FREE: 'free',
  PREMIUM: 'premium',
  VIP: 'vip',
} as const;

export const PAID_PLANS = [PLAN_NAME.PREMIUM, PLAN_NAME.VIP] as const;

export const isPaidPlan = (plan: string): plan is PaidPlanName =>
  PAID_PLANS.includes(plan as PaidPlanName);

/** Free trial: a small one-time allowance so visitors can try the generator before paying. */
const FreePlan: PricingPlan = {
  name: PLAN_NAME.FREE,
  price: 0,
  priceCents: 0,
  durationDays: 0,
};

/** Premium: one PayPhone payment grants 30 days of uncensored access. */
export const PremiumPlan: PricingPlan = {
  name: PLAN_NAME.PREMIUM,
  price: 19,
  priceCents: 1900,
  durationDays: 30,
};

/** VIP: 3x quota, higher burst limits and early access to new features. */
export const VipPlan: PricingPlan = {
  name: PLAN_NAME.VIP,
  price: 39,
  priceCents: 3900,
  durationDays: 30,
};

export const AllPlans = [FreePlan, PremiumPlan, VipPlan];

export const PlansByName: Record<PlanName, PricingPlan> = {
  free: FreePlan,
  premium: PremiumPlan,
  vip: VipPlan,
};

/**
 * Quotas per plan; keep Venice costs well under the plan price.
 * Free quotas are lifetime (never reset); paid quotas reset each calendar month.
 */
export const PlanLimitsByName: Record<PlanName, PlanLimits> = {
  free: {
    images: 3,
    tokens: 20_000,
    imagesPerMinute: 2,
    textsPerMinute: 5,
    resetsMonthly: false,
  },
  premium: {
    images: 500,
    tokens: 2_000_000,
    imagesPerMinute: 10,
    textsPerMinute: 20,
    resetsMonthly: true,
  },
  vip: {
    images: 1_500,
    tokens: 6_000_000,
    imagesPerMinute: 20,
    textsPerMinute: 40,
    resetsMonthly: true,
  },
};
