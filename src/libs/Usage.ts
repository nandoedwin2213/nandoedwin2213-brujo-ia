import type { GenerationType, PlanName, UsageSummary } from '@/types/Subscription';
import { and, count, eq, gte, sum } from 'drizzle-orm';
import { db } from '@/libs/DB';
import { generationSchema } from '@/models/Schema';
import { PlanLimitsByName } from '@/utils/PricingPlans';

const MINUTE_MS = 60_000;

/** First instant of the current UTC calendar month. */
const monthStart = () => {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
};

/** Consumption of the current quota period (calendar month, or lifetime for the free plan). */
export const getUsageSummary = async (userId: string, plan: PlanName): Promise<UsageSummary> => {
  const limits = PlanLimitsByName[plan];
  const since = limits.resetsMonthly ? monthStart() : new Date(0);

  const rows = await db
    .select({
      type: generationSchema.type,
      count: count(),
      tokens: sum(generationSchema.tokens),
    })
    .from(generationSchema)
    .where(and(eq(generationSchema.userId, userId), gte(generationSchema.createdAt, since)))
    .groupBy(generationSchema.type);

  const images = rows.find(r => r.type === 'image');
  const texts = rows.find(r => r.type === 'text');

  return {
    plan,
    resetsMonthly: limits.resetsMonthly,
    imagesUsed: images?.count ?? 0,
    imagesLimit: limits.images,
    tokensUsed: Number(texts?.tokens ?? 0),
    tokensLimit: limits.tokens,
  };
};

export type UsageCheck = { ok: true } | { ok: false; reason: 'quota' | 'rate_limit' };

/** Rejects when the plan quota is exhausted or the per-minute burst limit is hit. */
export const checkUsage = async (userId: string, plan: PlanName, type: GenerationType): Promise<UsageCheck> => {
  const summary = await getUsageSummary(userId, plan);
  const quotaExceeded = type === 'image'
    ? summary.imagesUsed >= summary.imagesLimit
    : summary.tokensUsed >= summary.tokensLimit;

  if (quotaExceeded) {
    return { ok: false, reason: 'quota' };
  }

  const [recent] = await db
    .select({ count: count() })
    .from(generationSchema)
    .where(and(
      eq(generationSchema.userId, userId),
      eq(generationSchema.type, type),
      gte(generationSchema.createdAt, new Date(Date.now() - MINUTE_MS)),
    ));
  const limits = PlanLimitsByName[plan];
  const perMinute = type === 'image' ? limits.imagesPerMinute : limits.textsPerMinute;

  if ((recent?.count ?? 0) >= perMinute) {
    return { ok: false, reason: 'rate_limit' };
  }

  return { ok: true };
};

export const recordGeneration = async (userId: string, type: GenerationType, tokens = 0) => {
  await db.insert(generationSchema).values({ userId, type, tokens });
};
