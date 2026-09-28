'use client';

import { useTranslations } from 'next-intl';
import { useId, useState } from 'react';
import { PayPhoneButton } from '@/features/billing/PayPhoneButton';

/** Legal acknowledgement gate: both PayPhone buttons stay disabled until the user accepts. */
export const PayPhoneCheckout = (props: { children?: React.ReactNode }) => {
  const t = useTranslations('PayPhoneCheckout');
  const [accepted, setAccepted] = useState(false);
  const id = useId();

  return (
    <div className="mt-4 grid gap-3">
      <label
        htmlFor={id}
        className="flex items-start gap-2 text-sm text-muted-foreground"
      >
        <input
          id={id}
          name="legal_acknowledgement"
          type="checkbox"
          required
          checked={accepted}
          onChange={e => setAccepted(e.target.checked)}
          className="mt-0.5 size-4 shrink-0 accent-primary"
        />
        <span>{t('acknowledgement')}</span>
      </label>
      <div className="
        flex flex-col gap-3
        sm:flex-row sm:items-center
      "
      >
        <PayPhoneButton plan="premium" className="sm:w-64" disabled={!accepted} />
        <PayPhoneButton plan="vip" variant="outline" className="sm:w-64" disabled={!accepted} />
        {props.children}
      </div>
    </div>
  );
};
