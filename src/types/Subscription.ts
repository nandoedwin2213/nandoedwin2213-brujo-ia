import type { EnumValues } from './Enum';
import type { PLAN_NAME } from '@/utils/PricingPlans';

type PlanName = EnumValues<typeof PLAN_NAME>;

export type PricingPlan = {
  name: PlanName;
  /** Price in USD. */
  price: number;
  /** Price in cents, as sent to PayPhone. */
  priceCents: number;
  /** Length of the PRO period granted by one payment (0 for the free plan). */
  durationDays: number;
};

export type GenerationType = 'text' | 'image';

/** Current-month consumption against the PRO quota. */
export type UsageSummary = {
  imagesUsed: number;
  imagesLimit: number;
  tokensUsed: number;
  tokensLimit: number;
};

export type UserSubscription = {
  isPro: boolean;
  proUntil: Date | null;
};
