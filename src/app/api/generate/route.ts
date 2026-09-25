import type { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import * as z from 'zod';
import { logger } from '@/libs/Logger';
import { getUserSubscription } from '@/libs/Subscription';
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

  try {
    const { type, prompt } = parsed.data;
    const result = type === 'text' ? await generateText(prompt) : await generateImage(prompt);

    return NextResponse.json({ type, result });
  } catch (error) {
    logger.error(`Venice error: ${error instanceof Error ? error.message : String(error)}`);

    return NextResponse.json({ error: 'Generation failed' }, { status: 502 });
  }
}
