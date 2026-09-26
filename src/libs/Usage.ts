import type { GenerationType, UsageSummary } from '@/types/Subscription';
import { and, count, eq, gte, sum } from 'drizzle-orm';
import { db } from '@/libs/DB';
import { generationSchema } from '@/models/Schema';
import { ProLimits } from '@/utils/PricingPlans';

const MINUTE_MS = 60_000;

/** First instant of the current UTC calendar month. */
const monthStart = () => {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
};

/** Consumption of the current month against the PRO quota. */
export const getUsageSummary = async (userId: string): Promise<UsageSummary> => {
  const rows = await db
    .select({
      type: generationSchema.type,
      count: count(),
      tokens: sum(generationSchema.tokens),
    })
    .from(generationSchema)
    .where(and(eq(generationSchema.userId, userId), gte(generationSchema.createdAt, monthStart())))
    .groupBy(generationSchema.type);

  const images = rows.find(r => r.type === 'image');
  const texts = rows.find(r => r.type === 'text');

  return {
    imagesUsed: images?.count ?? 0,
    imagesLimit: ProLimits.imagesPerMonth,
    tokensUsed: Number(texts?.tokens ?? 0),
    tokensLimit: ProLimits.tokensPerMonth,
  };
};

export type UsageCheck = { ok: true } | { ok: false; reason: 'quota' | 'rate_limit' };

/** Rejects when the monthly quota is exhausted or the per-minute burst limit is hit. */
export const checkUsage = async (userId: string, type: GenerationType): Promise<UsageCheck> => {
  const summary = await getUsageSummary(userId);
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
  const perMinute = type === 'image' ? ProLimits.imagesPerMinute : ProLimits.textsPerMinute;

  if ((recent?.count ?? 0) >= perMinute) {
    return { ok: false, reason: 'rate_limit' };
  }

  return { ok: true };
};

export const recordGeneration = async (userId: string, type: GenerationType, tokens = 0) => {
  await db.insert(generationSchema).values({ userId, type, tokens });
};
