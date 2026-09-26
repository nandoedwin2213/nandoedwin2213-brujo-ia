import { useTranslations } from 'next-intl';
import { Section } from '@/features/landing/Section';

const useCaseKeys = ['couples', 'creators', 'friends', 'roleplay', 'writers', 'marketing'] as const;

export const UseCases = () => {
  const t = useTranslations('UseCases');

  return (
    <Section
      id="use-cases"
      subtitle={t('section_subtitle')}
      title={t('section_title')}
      description={t('section_description')}
    >
      <div className="
        grid grid-cols-1 gap-4
        md:grid-cols-2
        lg:grid-cols-3
      "
      >
        {useCaseKeys.map(key => (
          <div
            key={key}
            className="
              flex flex-col rounded-xl border border-border bg-card p-6
            "
          >
            <div className="text-lg font-bold">{t(`${key}_title`)}</div>
            <p className="mt-2 flex-1 text-muted-foreground">
              {t(`${key}_description`)}
            </p>
            <blockquote className="
              mt-4 rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground
              italic
            "
            >
              {t(`${key}_example`)}
            </blockquote>
          </div>
        ))}
      </div>
    </Section>
  );
};
