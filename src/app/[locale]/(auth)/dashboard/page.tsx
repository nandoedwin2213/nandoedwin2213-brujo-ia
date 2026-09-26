import { auth } from '@clerk/nextjs/server';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { redirect } from 'next/navigation';
import { buttonVariants } from '@/components/ui/buttonVariants';
import { PayPhoneButton } from '@/features/billing/PayPhoneButton';
import { TitleBar } from '@/features/dashboard/TitleBar';
import { GeneratorForm } from '@/features/generator/GeneratorForm';
import { Link } from '@/libs/I18nNavigation';
import { getUserSubscription } from '@/libs/Subscription';
import { getUsageSummary } from '@/libs/Usage';
import { cn } from '@/utils/Helpers';
import { PlanLimitsByName, PremiumPlan, VipPlan } from '@/utils/PricingPlans';

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
  const usage = await getUsageSummary(userId, subscription.plan);
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

      {!subscription.isPaid && (
        <div className="
          mb-6 rounded-xl border border-primary/40 bg-primary/5 p-5
        "
        >
          <div className="text-lg font-semibold">{t('free_banner_title')}</div>
          <p className="mt-1 text-sm text-muted-foreground">
            {t('free_banner_description', {
              images: PlanLimitsByName.free.images,
              premiumPrice: PremiumPlan.price,
              premiumImages: PlanLimitsByName.premium.images,
              vipPrice: VipPlan.price,
              vipImages: PlanLimitsByName.vip.images,
            })}
          </p>
          <div className="
            mt-4 flex flex-col gap-3
            sm:flex-row
          "
          >
            <PayPhoneButton plan="premium" className="sm:w-64" />
            <PayPhoneButton plan="vip" variant="outline" className="sm:w-64" />
            <Link href="/pricing" className={buttonVariants({ variant: 'link', size: 'sm' })}>
              {t('paywall_pricing_link')}
            </Link>
          </div>
        </div>
      )}

      <GeneratorForm usage={usage} />
    </>
  );
};
