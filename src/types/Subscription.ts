import type { EnumValues } from './Enum';
import type { PAID_PLANS, PLAN_NAME } from '@/utils/PricingPlans';

export type PlanName = EnumValues<typeof PLAN_NAME>;

export type PaidPlanName = (typeof PAID_PLANS)[number];

export type PricingPlan = {
  name: PlanName;
  /** Price in USD. */
  price: number;
  /** Price in cents, as sent to PayPhone. */
  priceCents: number;
  /** Length of the access period granted by one payment (0 for the free plan). */
  durationDays: number;
};

export type PlanLimits = {
  images: number;
  tokens: number;
  imagesPerMinute: number;
  textsPerMinute: number;
  /** Monthly quota when true; lifetime quota when false. */
  resetsMonthly: boolean;
};

export type GenerationType = 'text' | 'image';

/** Consumption against the quota of the user's current plan. */
export type UsageSummary = {
  plan: PlanName;
  resetsMonthly: boolean;
  imagesUsed: number;
  imagesLimit: number;
  tokensUsed: number;
  tokensLimit: number;
};

export type UserSubscription = {
  /** Effective plan: paid plans fall back to `free` once expired. */
  plan: PlanName;
  isPaid: boolean;
  paidUntil: Date | null;
};
