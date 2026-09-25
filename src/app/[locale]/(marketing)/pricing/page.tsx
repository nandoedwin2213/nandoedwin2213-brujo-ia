import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { FAQ } from '@/templates/FAQ';
import { Footer } from '@/templates/Footer';
import { Navbar } from '@/templates/Navbar';
import { Pricing } from '@/templates/Pricing';

type PricingPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata(props: PricingPageProps): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({
    locale,
    namespace: 'PricingPage',
  });

  return {
    title: t('meta_title'),
    description: t('meta_description'),
  };
}

export default async function PricingPage(props: PricingPageProps) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  return (
    <>
      <Navbar />
      <Pricing />
      <FAQ />
      <Footer />
    </>
  );
};
