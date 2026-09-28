import { NextResponse } from 'next/server';
import { Env } from '@/libs/Env';
import { isMailConfigured, sendMail } from '@/libs/Mailer';
import { getVeniceBalance } from '@/libs/VeniceBalance';
import { AppConfig } from '@/utils/AppConfig';

/** Daily Vercel Cron: emails support when the Venice prepaid balance drops below the threshold. */
export async function GET(req: Request) {
  if (!Env.CRON_SECRET || req.headers.get('authorization') !== `Bearer ${Env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const balance = await getVeniceBalance();
  const threshold = Env.VENICE_BALANCE_ALERT_USD;
  const low = balance.usd < threshold;
  let emailed = false;

  if (low && isMailConfigured()) {
    await sendMail({
      to: AppConfig.email.support,
      subject: `[${AppConfig.name}] Saldo bajo del proveedor de IA: $${balance.usd.toFixed(2)}`,
      text: [
        `El saldo prepagado del proveedor de IA es de $${balance.usd.toFixed(2)} USD, por debajo del umbral de $${threshold} USD.`,
        '',
        'Recarga en https://venice.ai/settings/api para que el servicio no se interrumpa.',
        '',
        `Panel de administración: ${Env.NEXT_PUBLIC_APP_URL ?? 'https://aliada.life'}/dashboard/admin`,
      ].join('\n'),
    });
    emailed = true;
  }

  return NextResponse.json({ balanceUsd: balance.usd, threshold, low, emailed });
}
