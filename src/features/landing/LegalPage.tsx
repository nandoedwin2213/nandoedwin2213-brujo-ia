import { useTranslations } from 'next-intl';
import { Footer } from '@/templates/Footer';
import { Navbar } from '@/templates/Navbar';
import { AppConfig } from '@/utils/AppConfig';

type LegalSection = { title: string; body: string[] };

export const LegalPage = (props: { namespace: 'Terms' | 'Privacy' }) => {
  const t = useTranslations(props.namespace);
  const sections = t.raw('sections') as LegalSection[];

  return (
    <>
      <Navbar />
      <article className="mx-auto max-w-3xl px-3 py-16">
        <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{t('updated')}</p>
        <p className="mt-6 text-muted-foreground">{t('intro')}</p>
        {sections.map(section => (
          <section key={section.title} className="mt-8">
            <h2 className="text-xl font-semibold">{section.title}</h2>
            {section.body.map(paragraph => (
              <p
                key={paragraph}
                className="mt-3 leading-relaxed text-muted-foreground"
              >
                {paragraph}
              </p>
            ))}
          </section>
        ))}
        <p className="mt-10 text-sm text-muted-foreground">
          {t('contact')}
          {' '}
          <a
            href={`mailto:${AppConfig.email.support}`}
            className="text-primary underline"
          >
            {AppConfig.email.support}
          </a>
        </p>
      </article>
      <Footer />
    </>
  );
};
