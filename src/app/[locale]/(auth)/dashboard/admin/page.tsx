import { currentUser } from '@clerk/nextjs/server';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { TitleBar } from '@/features/dashboard/TitleBar';
import { getAdminStats, isAdminEmail } from '@/libs/AdminStats';
import { Env } from '@/libs/Env';
import { isMailConfigured } from '@/libs/Mailer';
import { getVeniceBalance } from '@/libs/VeniceBalance';
import { cn } from '@/utils/Helpers';

const Stat = (props: { label: string; value: React.ReactNode; className?: string }) => (
  <div className={cn('rounded-xl border bg-card p-5', props.className)}>
    <div className="text-sm text-muted-foreground">{props.label}</div>
    <div className="mt-1 text-2xl font-semibold">{props.value}</div>
  </div>
);

export default async function AdminPage(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  const user = await currentUser();
  if (!isAdminEmail(user?.primaryEmailAddress?.emailAddress)) {
    notFound();
  }

  const t = await getTranslations({ locale, namespace: 'AdminPage' });
  const [balance, stats] = await Promise.all([getVeniceBalance(), getAdminStats()]);
  const threshold = Env.VENICE_BALANCE_ALERT_USD;
  const low = balance.usd < threshold;
  const money = (cents: number) => `$${(cents / 100).toFixed(2)}`;

  return (
    <>
      <TitleBar title={t('title_bar')} description={t('title_bar_description')} />

      <div className="
        grid gap-4
        sm:grid-cols-2
        lg:grid-cols-4
      "
      >
        <Stat
          label={t('balance')}
          value={`$${balance.usd.toFixed(2)}`}
          className={low
            ? 'border-red-500/60 bg-red-500/10'
            : `border-green-500/40 bg-green-500/5`}
        />
        <Stat label={t('threshold')} value={`$${threshold}`} />
        <Stat label={t('images_30d')} value={stats.imagesLast30d.toLocaleString(locale)} />
        <Stat label={t('tokens_30d')} value={stats.tokensLast30d.toLocaleString(locale)} />
        <Stat label={t('revenue_30d')} value={money(stats.revenueLast30dCents)} />
        {stats.activeSubscriptions.map(s => (
          <Stat key={s.plan} label={t('active_plan', { plan: s.plan })} value={s.count} />
        ))}
      </div>

      <div className="
        mt-6 rounded-xl border bg-card p-5 text-sm text-muted-foreground
      "
      >
        <p>{low ? t('alert_low', { threshold }) : t('alert_ok', { threshold })}</p>
        <p className="mt-2">{isMailConfigured() ? t('mail_configured') : t('mail_missing')}</p>
        <a
          href="https://venice.ai/settings/api"
          target="_blank"
          rel="noreferrer"
          className="mt-3 inline-block text-primary underline"
        >
          {t('recharge_link')}
        </a>
      </div>
    </>
  );
}
