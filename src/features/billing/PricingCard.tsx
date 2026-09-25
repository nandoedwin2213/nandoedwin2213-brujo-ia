import type { PricingPlan } from '@/types/Subscription';
import { useTranslations } from 'next-intl';
import { PricingFeatureItem } from './PricingFeatureItem';

const FEATURE_KEYS = ['feature_1', 'feature_2', 'feature_3', 'feature_4'] as const;

export const PricingCard = (props: {
  plan: PricingPlan;
  button: React.ReactNode;
}) => {
  const tPlans = useTranslations('PricingPlans');
  const t = useTranslations('PricingCard');

  return (
    <div className="rounded-xl border border-border px-6 py-8 text-center">
      <div className="text-lg font-semibold">
        {tPlans(`${props.plan.name}_plan_name`)}
      </div>

      <div className="mt-3 flex items-center justify-center">
        <div className="text-5xl font-bold">
          {t('plan_price', { price: props.plan.price })}
        </div>

        <div className="ml-1 text-muted-foreground">
          {props.plan.durationDays > 0 ? t('plan_interval_days', { days: props.plan.durationDays }) : t('plan_interval_free')}
        </div>
      </div>

      <div className="mt-2 mb-5 text-sm text-muted-foreground">
        {t(`${props.plan.name}_plan_description`)}
      </div>

      {props.button}

      <ul className="mt-8 space-y-3 text-left">
        {FEATURE_KEYS.map(key => (
          <PricingFeatureItem key={key}>
            {tPlans(`${props.plan.name}_${key}`)}
          </PricingFeatureItem>
        ))}
      </ul>
    </div>
  );
};
