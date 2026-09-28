import { Env } from '@/libs/Env';

const VENICE_API = 'https://api.venice.ai/api/v1';

export type VeniceBalance = { usd: number; diem: number; bundledCredits: number };

/** Prepaid balance of the Venice API key. */
export const getVeniceBalance = async (): Promise<VeniceBalance> => {
  const res = await fetch(`${VENICE_API}/api_keys/rate_limits`, {
    headers: { Authorization: `Bearer ${Env.VENICE_API_KEY}` },
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error(`Venice rate_limits failed (${res.status}): ${await res.text()}`);
  }

  const data: { data?: { balances?: { USD?: number; DIEM?: number; BUNDLED_CREDITS?: number } } } = await res.json();
  const balances = data.data?.balances ?? {};

  return {
    usd: balances.USD ?? 0,
    diem: balances.DIEM ?? 0,
    bundledCredits: balances.BUNDLED_CREDITS ?? 0,
  };
};
