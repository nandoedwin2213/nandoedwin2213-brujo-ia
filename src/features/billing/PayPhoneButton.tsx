'use client';

import type { PaidPlanName } from '@/types/Subscription';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { buttonVariants } from '@/components/ui/buttonVariants';
import { cn } from '@/utils/Helpers';
import { PlansByName } from '@/utils/PricingPlans';

export const PayPhoneButton = (props: {
  plan: PaidPlanName;
  className?: string;
  variant?: 'default' | 'outline';
}) => {
  const t = useTranslations('PayPhoneButton');
  const tPlans = useTranslations('PricingPlans');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startCheckout = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/payphone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: props.plan }),
      });
      const data: { url?: string } = await res.json();

      if (!res.ok || !data.url) {
        throw new Error('prepare failed');
      }

      window.location.assign(data.url);
    } catch {
      setError(t('error'));
      setLoading(false);
    }
  };

  return (
    <div className={props.className}>
      <button
        type="button"
        onClick={startCheckout}
        disabled={loading}
        className={cn(buttonVariants({ size: 'lg', variant: props.variant ?? 'default' }), `
          w-full
        `)}
      >
        {loading
          ? t('loading')
          : t('label', { plan: tPlans(`${props.plan}_plan_name`), price: PlansByName[props.plan].price })}
      </button>
      {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
    </div>
  );
};
