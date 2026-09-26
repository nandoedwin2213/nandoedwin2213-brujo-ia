import type { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import * as z from 'zod';
import { logger } from '@/libs/Logger';
import { getUserSubscription } from '@/libs/Subscription';
import { checkUsage, getUsageSummary, recordGeneration } from '@/libs/Usage';
import { generateImage, generateText } from '@/libs/Venice';

const GenerateSchema = z.object({
  type: z.enum(['text', 'image']),
  prompt: z.string().trim().min(1).max(4000),
});

/** PRO-only Venice.ai generation endpoint. */
export async function POST(request: NextRequest) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const subscription = await getUserSubscription(userId);

  if (!subscription.isPro) {
    return NextResponse.json({ error: 'PRO plan required' }, { status: 402 });
  }

  const parsed = GenerateSchema.safeParse(await request.json().catch(() => null));

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 422 });
  }

  const { type, prompt } = parsed.data;
  const usage = await checkUsage(userId, type);

  if (!usage.ok) {
    return NextResponse.json(
      { error: usage.reason, usage: await getUsageSummary(userId) },
      { status: usage.reason === 'quota' ? 402 : 429 },
    );
  }

  try {
    let result: string;
    let tokens = 0;

    if (type === 'text') {
      ({ content: result, tokens } = await generateText(prompt));
    } else {
      result = await generateImage(prompt);
    }

    await recordGeneration(userId, type, tokens);

    return NextResponse.json({ type, result, usage: await getUsageSummary(userId) });
  } catch (error) {
    logger.error(`Venice error: ${error instanceof Error ? error.message : String(error)}`);

    return NextResponse.json({ error: 'Generation failed' }, { status: 502 });
  }
}
