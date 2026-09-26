import { auth } from '@clerk/nextjs/server';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { redirect } from 'next/navigation';
import { buttonVariants } from '@/components/ui/buttonVariants';
import { PayPhoneButton } from '@/features/billing/PayPhoneButton';
import { PageMessage } from '@/features/dashboard/PageMessage';
import { TitleBar } from '@/features/dashboard/TitleBar';
import { GeneratorForm } from '@/features/generator/GeneratorForm';
import { Link } from '@/libs/I18nNavigation';
import { getUserSubscription } from '@/libs/Subscription';
import { getUsageSummary } from '@/libs/Usage';
import { cn } from '@/utils/Helpers';
import { ProPlan } from '@/utils/PricingPlans';

const paymentOutcomes = ['approved', 'cancelled', 'rejected', 'error'] as const;
type PaymentOutcome = (typeof paymentOutcomes)[number];

const isPaymentOutcome = (value: string | undefined): value is PaymentOutcome =>
  paymentOutcomes.includes(value as PaymentOutcome);

export default async function DashboardIndexPage(props: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ payment?: string }>;
}) {
  const { locale } = await props.params;
  const { payment } = await props.searchParams;
  setRequestLocale(locale);
  const t = await getTranslations({
    locale,
    namespace: 'DashboardIndexPage',
  });

  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  const subscription = await getUserSubscription(userId);
  const outcome = isPaymentOutcome(payment) ? payment : null;

  return (
    <>
      <TitleBar
        title={t('title_bar')}
        description={t('title_bar_description')}
      />

      {outcome && (
        <div
          role="status"
          className={cn(
            'mb-6 rounded-md border px-4 py-3 text-sm',
            outcome === 'approved'
              ? 'border-green-500/40 bg-green-500/10'
              : 'border-yellow-500/40 bg-yellow-500/10',
          )}
        >
          {t(`payment_${outcome}`)}
        </div>
      )}

      {subscription.isPro
        ? (
            <GeneratorForm usage={await getUsageSummary(userId)} />
          )
        : (
            <PageMessage
              icon={(
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M0 0h24v24H0z" stroke="none" />
                  <rect x="5" y="11" width="14" height="10" rx="2" />
                  <circle cx="12" cy="16" r="1" />
                  <path d="M8 11V7a4 4 0 018 0v4" />
                </svg>
              )}
              title={t('paywall_title')}
              description={t('paywall_description', { price: ProPlan.price, days: ProPlan.durationDays })}
              button={(
                <div className="flex flex-col items-center gap-3">
                  <PayPhoneButton className="w-64" />
                  <Link href="/pricing" className={buttonVariants({ variant: 'link', size: 'sm' })}>
                    {t('paywall_pricing_link')}
                  </Link>
                </div>
              )}
            />
          )}
    </>
  );
};
