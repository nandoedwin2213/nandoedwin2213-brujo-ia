'use client';

import type { GenerationType, UsageSummary } from '@/types/Subscription';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { buttonVariants } from '@/components/ui/buttonVariants';
import { cn } from '@/utils/Helpers';

type ApiResponse = {
  type?: GenerationType;
  result?: string;
  error?: string;
  usage?: UsageSummary;
};

const UsageBar = (props: { label: string; used: number; limit: number }) => {
  const percent = Math.min(100, Math.round((props.used / props.limit) * 100));

  return (
    <div>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{props.label}</span>
        <span>
          {props.used.toLocaleString()}
          {' / '}
          {props.limit.toLocaleString()}
        </span>
      </div>
      <div className="mt-1 h-1.5 w-full rounded-full bg-muted">
        <div
          className={cn('h-1.5 rounded-full', percent >= 90
            ? 'bg-destructive'
            : `bg-primary`)}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
};

export const GeneratorForm = (props: { usage: UsageSummary }) => {
  const t = useTranslations('Generator');
  const [usage, setUsage] = useState(props.usage);
  const [type, setType] = useState<GenerationType>('text');
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ type: GenerationType; result: string } | null>(null);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, prompt }),
      });
      const data: ApiResponse = await res.json();

      if (data.usage) {
        setUsage(data.usage);
      }

      if (!res.ok || !data.result || !data.type) {
        if (res.status === 429) {
          setError(t('error_rate_limit'));
        } else if (res.status === 402) {
          setError(data.error === 'quota' ? t('error_quota') : t('error_pro_required'));
        } else {
          setError(t('error_generic'));
        }
        return;
      }

      setResult({ type: data.type, result: data.result });
    } catch {
      setError(t('error_generic'));
    } finally {
      setLoading(false);
    }
  };

  const tabClass = (active: boolean) =>
    cn(buttonVariants({ variant: active ? 'default' : 'outline', size: 'sm' }));

  return (
    <div className="
      grid gap-6
      lg:grid-cols-2
    "
    >
      <form
        onSubmit={submit}
        className="rounded-xl border border-border bg-background p-5"
      >
        <div className="flex gap-2">
          <button type="button" className={tabClass(type === 'text')} onClick={() => setType('text')}>
            {t('tab_text')}
          </button>
          <button type="button" className={tabClass(type === 'image')} onClick={() => setType('image')}>
            {t('tab_image')}
          </button>
        </div>

        <label htmlFor="prompt" className="mt-5 block text-sm font-medium">
          {t('prompt_label')}
        </label>
        <textarea
          id="prompt"
          name="prompt"
          required
          minLength={1}
          maxLength={4000}
          rows={8}
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          placeholder={type === 'text' ? t('prompt_placeholder_text') : t('prompt_placeholder_image')}
          className="
            mt-2 w-full rounded-md border border-input bg-transparent px-3 py-2
            text-sm shadow-xs outline-none
            focus-visible:ring-2 focus-visible:ring-ring
          "
        />

        <button
          type="submit"
          disabled={loading || prompt.trim().length === 0}
          className={cn(buttonVariants({ size: 'lg' }), 'mt-4 w-full')}
        >
          {loading ? t('generating') : t('generate')}
        </button>

        {error && <p className="mt-3 text-sm text-destructive">{error}</p>}

        <div className="mt-5 grid gap-3 border-t border-border pt-4">
          <UsageBar label={t('usage_images')} used={usage.imagesUsed} limit={usage.imagesLimit} />
          <UsageBar label={t('usage_tokens')} used={usage.tokensUsed} limit={usage.tokensLimit} />
          <p className="text-xs text-muted-foreground">{t('usage_note')}</p>
        </div>
      </form>

      <div className="
        min-h-80 rounded-xl border border-border bg-background p-5
      "
      >
        <div className="text-sm font-medium text-muted-foreground">{t('result_title')}</div>

        {!result && !loading && (
          <p className="mt-4 text-sm text-muted-foreground">{t('result_empty')}</p>
        )}

        {loading && <p className="mt-4 animate-pulse text-sm">{t('generating')}</p>}

        {result?.type === 'text' && (
          <p className="mt-4 text-sm/relaxed whitespace-pre-wrap">{result.result}</p>
        )}

        {result?.type === 'image' && (
          // eslint-disable-next-line next/no-img-element -- data URL from Venice
          <img
            src={result.result}
            alt={prompt}
            className="mt-4 w-full rounded-lg"
          />
        )}
      </div>
    </div>
  );
};
