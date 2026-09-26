import { useTranslations } from 'next-intl';
import { Background } from '@/components/Background';
import { Section } from '@/features/landing/Section';

const stepKeys = ['step1', 'step2', 'step3', 'step4'] as const;

export const HowItWorks = () => {
  const t = useTranslations('HowItWorks');

  return (
    <Background>
      <Section
        id="how-it-works"
        subtitle={t('section_subtitle')}
        title={t('section_title')}
        description={t('section_description')}
      >
        <ol className="
          grid grid-cols-1 gap-6
          md:grid-cols-2
          lg:grid-cols-4
        "
        >
          {stepKeys.map((key, index) => (
            <li
              key={key}
              className="rounded-xl border border-border bg-background p-5"
            >
              <div className="
                flex size-10 items-center justify-center rounded-full
                bg-linear-to-br from-indigo-400 via-purple-400 to-pink-400
                text-lg font-bold text-white
              "
              >
                {index + 1}
              </div>
              <div className="mt-3 text-lg font-bold">{t(`${key}_title`)}</div>
              <p className="mt-2 text-muted-foreground">
                {t(`${key}_description`)}
              </p>
            </li>
          ))}
        </ol>

        <div className="mt-10 rounded-xl border border-border bg-background p-6">
          <div className="text-lg font-bold">{t('tips_title')}</div>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-muted-foreground">
            <li>{t('tip1')}</li>
            <li>{t('tip2')}</li>
            <li>{t('tip3')}</li>
            <li>{t('tip4')}</li>
          </ul>
        </div>
      </Section>
    </Background>
  );
};
