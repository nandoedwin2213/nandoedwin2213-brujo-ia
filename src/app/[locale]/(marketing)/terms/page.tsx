import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { LegalPage } from '@/features/landing/LegalPage';

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: 'Terms' });

  return {
    title: t('meta_title'),
    description: t('meta_description'),
  };
}

export default async function TermsPage(props: Props) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  return <LegalPage namespace="Terms" />;
};
