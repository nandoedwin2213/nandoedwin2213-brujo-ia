import { auth } from '@clerk/nextjs/server';
import { desc, eq } from 'drizzle-orm';
import { getFormatter, getTranslations, setRequestLocale } from 'next-intl/server';
import { redirect } from 'next/navigation';
import { PayPhoneButton } from '@/features/billing/PayPhoneButton';
import { TitleBar } from '@/features/dashboard/TitleBar';
import { db } from '@/libs/DB';
import { getUserSubscription } from '@/libs/Subscription';
import { paymentSchema } from '@/models/Schema';
import { PremiumPlan, VipPlan } from '@/utils/PricingPlans';

export default async function BillingPage(props: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'BillingPage' });
  const tPlans = await getTranslations({ locale, namespace: 'PricingPlans' });
  const format = await getFormatter({ locale });

  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  const subscription = await getUserSubscription(userId);
  const payments = await db.query.paymentSchema.findMany({
    where: eq(paymentSchema.userId, userId),
    orderBy: desc(paymentSchema.createdAt),
    limit: 20,
  });

  return (
    <>
      <TitleBar title={t('title_bar')} description={t('title_bar_description')} />

      <div className="rounded-xl border border-border bg-background p-6">
        <div className="text-lg font-semibold">
          {t('status_plan', { plan: tPlans(`${subscription.plan}_plan_name`) })}
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          {subscription.isPaid && subscription.paidUntil
            ? t('paid_until', { date: format.dateTime(subscription.paidUntil, { dateStyle: 'long' }) })
            : t('upgrade_hint', {
                premiumPrice: PremiumPlan.price,
                vipPrice: VipPlan.price,
                days: PremiumPlan.durationDays,
              })}
        </p>
        <div className="
          mt-5 flex flex-col gap-3
          sm:flex-row
        "
        >
          <PayPhoneButton plan="premium" className="sm:w-64" />
          <PayPhoneButton plan="vip" variant="outline" className="sm:w-64" />
        </div>
      </div>

      <div className="mt-8">
        <div className="mb-3 text-lg font-semibold">{t('history_title')}</div>
        {payments.length === 0
          ? (
              <p className="text-sm text-muted-foreground">{t('history_empty')}</p>
            )
          : (
              <table className="w-full text-sm">
                <thead className="text-left text-muted-foreground">
                  <tr>
                    <th className="py-2">{t('col_date')}</th>
                    <th className="py-2">{t('col_plan')}</th>
                    <th className="py-2">{t('col_amount')}</th>
                    <th className="py-2">{t('col_status')}</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map(payment => (
                    <tr key={payment.id} className="border-t border-border">
                      <td className="py-2">{format.dateTime(payment.createdAt, { dateStyle: 'medium', timeStyle: 'short' })}</td>
                      <td className="py-2">{tPlans(`${payment.plan}_plan_name`)}</td>
                      <td className="py-2">{format.number(payment.amountCents / 100, { style: 'currency', currency: payment.currency })}</td>
                      <td className="py-2">{payment.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
      </div>
    </>
  );
};
