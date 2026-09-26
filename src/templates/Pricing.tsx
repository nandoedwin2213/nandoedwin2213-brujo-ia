import { useTranslations } from 'next-intl';
import { buttonVariants } from '@/components/ui/buttonVariants';
import { PricingCard } from '@/features/billing/PricingCard';
import { Section } from '@/features/landing/Section';
import { Link } from '@/libs/I18nNavigation';
import { AllPlans, PLAN_NAME } from '@/utils/PricingPlans';

export const Pricing = () => {
  const t = useTranslations('Pricing');

  return (
    <Section
      id="pricing"
      subtitle={t('section_subtitle')}
      title={t('section_title')}
      description={t('section_description')}
    >
      <div className="
        mx-auto grid max-w-5xl grid-cols-1 gap-x-6 gap-y-8
        @xl:grid-cols-3
      "
      >
        {AllPlans.map(plan => (
          <PricingCard
            key={plan.name}
            plan={plan}
            highlighted={plan.name === PLAN_NAME.PREMIUM}
            button={(
              <Link
                className={buttonVariants({
                  size: 'sm',
                  variant: plan.name === PLAN_NAME.PREMIUM ? 'default' : 'outline',
                  className: 'w-full',
                })}
                href={plan.name === PLAN_NAME.FREE ? '/sign-up' : '/dashboard/billing'}
              >
                {t(`button_${plan.name}`)}
              </Link>
            )}
          />
        ))}
      </div>
    </Section>
  );
};
