import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { db } from '@/libs/DB';
import { logger } from '@/libs/Logger';
import { preparePayment } from '@/libs/PayPhone';
import { paymentSchema } from '@/models/Schema';
import { getBaseUrl } from '@/utils/Helpers';
import { ProPlan } from '@/utils/PricingPlans';

/** Creates a PayPhone checkout for the PRO plan and returns the payment URL. */
export async function POST() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const clientTransactionId = `brujo-${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;
  const baseUrl = getBaseUrl();

  try {
    const prepared = await preparePayment({
      amountCents: ProPlan.priceCents,
      clientTransactionId,
      reference: 'Brujo IA PRO - 30 dias',
      responseUrl: `${baseUrl}/api/payphone/response`,
      cancellationUrl: `${baseUrl}/api/payphone/response?cancelled=1`,
    });

    await db.insert(paymentSchema).values({
      userId,
      clientTransactionId,
      amountCents: ProPlan.priceCents,
      status: 'PENDING',
    });

    return NextResponse.json({ url: prepared.payWithCard, paymentId: prepared.paymentId });
  } catch (error) {
    logger.error(`PayPhone prepare error: ${error instanceof Error ? error.message : String(error)}`);

    return NextResponse.json({ error: 'No se pudo iniciar el pago' }, { status: 502 });
  }
}
