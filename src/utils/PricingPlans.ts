import type { PricingPlan } from '@/types/Subscription';

/** Pricing plans */
export const PLAN_NAME = {
  FREE: 'free',
  PRO: 'pro',
} as const;

/** Configuration for the Free subscription plan. */
const FreePlan: PricingPlan = {
  name: PLAN_NAME.FREE,
  price: 0,
  priceCents: 0,
  durationDays: 0,
};

/** PRO plan: one PayPhone payment grants 30 days of unrestricted access. */
export const ProPlan: PricingPlan = {
  name: PLAN_NAME.PRO,
  price: 19,
  priceCents: 1900,
  durationDays: 30,
};

export const AllPlans = [FreePlan, ProPlan];
