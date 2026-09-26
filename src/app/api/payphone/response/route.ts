import type { NextRequest } from 'next/server';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { db } from '@/libs/DB';
import { logger } from '@/libs/Logger';
import { confirmPayment } from '@/libs/PayPhone';
import { grantPlan } from '@/libs/Subscription';
import { paymentSchema } from '@/models/Schema';
import { getBaseUrl } from '@/utils/Helpers';
import { isPaidPlan } from '@/utils/PricingPlans';

type PaymentOutcome = 'approved' | 'cancelled' | 'rejected' | 'error';

const redirectToDashboard = (outcome: PaymentOutcome) =>
  NextResponse.redirect(`${getBaseUrl()}/dashboard?payment=${outcome}`);

/**
 * PayPhone return URL. PayPhone appends `id` and `clientTransactionId`
 * (or `clientTxId`) to the query string; the payment is confirmed server-side.
 */
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const id = Number(params.get('id'));
  const clientTxId = params.get('clientTransactionId') ?? params.get('clientTxId');
  const cancelled = params.get('cancelled') === '1';

  if (!clientTxId) {
    return redirectToDashboard(cancelled ? 'cancelled' : 'error');
  }

  const payment = await db.query.paymentSchema.findFirst({
    where: eq(paymentSchema.clientTransactionId, clientTxId),
  });

  if (!payment) {
    return redirectToDashboard('error');
  }

  if (payment.status === 'APPROVED') {
    return redirectToDashboard('approved');
  }

  if (cancelled || !id) {
    await db
      .update(paymentSchema)
      .set({ status: 'CANCELLED' })
      .where(eq(paymentSchema.id, payment.id));

    return redirectToDashboard('cancelled');
  }

  try {
    const result = await confirmPayment(id, clientTxId);
    const approved = result.transactionStatus === 'Approved';

    await db
      .update(paymentSchema)
      .set({
        status: approved ? 'APPROVED' : result.transactionStatus === 'Canceled' ? 'CANCELLED' : 'REJECTED',
        payphoneTransactionId: String(result.transactionId ?? id),
        rawResponse: result,
      })
      .where(eq(paymentSchema.id, payment.id));

    if (!approved) {
      return redirectToDashboard(result.transactionStatus === 'Canceled' ? 'cancelled' : 'rejected');
    }

    await grantPlan(payment.userId, isPaidPlan(payment.plan) ? payment.plan : 'premium');

    return redirectToDashboard('approved');
  } catch (error) {
    logger.error(`PayPhone confirm error: ${error instanceof Error ? error.message : String(error)}`);

    await db
      .update(paymentSchema)
      .set({ status: 'ERROR' })
      .where(eq(paymentSchema.id, payment.id));

    return redirectToDashboard('error');
  }
}
