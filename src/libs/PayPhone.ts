import { Env } from '@/libs/Env';

const PAYPHONE_API = 'https://pay.payphonetodoesposible.com/api';

export type PayPhonePrepareInput = {
  amountCents: number;
  clientTransactionId: string;
  reference: string;
  responseUrl: string;
  cancellationUrl: string;
};

export type PayPhonePrepareResult = {
  paymentId: number;
  payWithCard: string;
  payWithPayPhone: string;
};

export type PayPhoneConfirmResult = {
  transactionId: number;
  clientTransactionId: string;
  transactionStatus: 'Approved' | 'Canceled' | string;
  statusCode: number;
  amount: number;
  message?: string | null;
  [key: string]: unknown;
};

const headers = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${Env.PAYPHONE_AUTH_TOKEN}`,
});

/** Creates a PayPhone "Cajita de pagos" link. `storeId` is only sent when configured. */
export const preparePayment = async (input: PayPhonePrepareInput): Promise<PayPhonePrepareResult> => {
  const body: Record<string, unknown> = {
    amount: input.amountCents,
    amountWithoutTax: input.amountCents,
    amountWithTax: 0,
    tax: 0,
    service: 0,
    tip: 0,
    currency: 'USD',
    clientTransactionId: input.clientTransactionId,
    reference: input.reference,
    responseUrl: input.responseUrl,
    cancellationUrl: input.cancellationUrl,
  };

  if (Env.PAYPHONE_STORE_ID) {
    body.storeId = Env.PAYPHONE_STORE_ID;
  }

  const res = await fetch(`${PAYPHONE_API}/button/Prepare`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    throw new Error(`PayPhone Prepare failed (${res.status}): ${await res.text()}`);
  }

  return res.json();
};

/** Confirms a transaction server-side after the customer returns from PayPhone. */
export const confirmPayment = async (id: number, clientTxId: string): Promise<PayPhoneConfirmResult> => {
  const res = await fetch(`${PAYPHONE_API}/button/V2/Confirm`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ id, clientTxId }),
  });

  if (!res.ok) {
    throw new Error(`PayPhone Confirm failed (${res.status}): ${await res.text()}`);
  }

  return res.json();
};
