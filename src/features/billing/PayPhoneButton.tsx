'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { buttonVariants } from '@/components/ui/buttonVariants';
import { cn } from '@/utils/Helpers';

export const PayPhoneButton = (props: { className?: string }) => {
  const t = useTranslations('PayPhoneButton');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startCheckout = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/payphone', { method: 'POST' });
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
        className={cn(buttonVariants({ size: 'lg' }), 'w-full')}
      >
        {loading ? t('loading') : t('label')}
      </button>
      {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
    </div>
  );
};
