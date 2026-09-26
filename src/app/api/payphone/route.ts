import type { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import * as z from 'zod';
import { db } from '@/libs/DB';
import { logger } from '@/libs/Logger';
import { preparePayment } from '@/libs/PayPhone';
import { paymentSchema } from '@/models/Schema';
import { getBaseUrl } from '@/utils/Helpers';
import { PAID_PLANS, PlansByName } from '@/utils/PricingPlans';

const CheckoutSchema = z.object({
  plan: z.enum(PAID_PLANS).default('premium'),
});

/** Creates a PayPhone checkout for a paid plan and returns the payment URL. */
export async function POST(request: NextRequest) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const parsed = CheckoutSchema.safeParse(await request.json().catch(() => ({})));

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid plan' }, { status: 422 });
  }

  const { plan } = parsed.data;
  const pricing = PlansByName[plan];
  const clientTransactionId = `brujo-${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;
  const baseUrl = getBaseUrl();

  try {
    const prepared = await preparePayment({
      amountCents: pricing.priceCents,
      clientTransactionId,
      reference: `Brujo IA ${plan.toUpperCase()} - ${pricing.durationDays} dias`,
      responseUrl: `${baseUrl}/api/payphone/response`,
      cancellationUrl: `${baseUrl}/api/payphone/response?cancelled=1`,
    });

    await db.insert(paymentSchema).values({
      userId,
      clientTransactionId,
      plan,
      amountCents: pricing.priceCents,
      status: 'PENDING',
    });

    return NextResponse.json({ url: prepared.payWithCard, paymentId: prepared.paymentId });
  } catch (error) {
    logger.error(`PayPhone prepare error: ${error instanceof Error ? error.message : String(error)}`);

    return NextResponse.json({ error: 'No se pudo iniciar el pago' }, { status: 502 });
  }
}
