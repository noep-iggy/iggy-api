import { BillingPlanTypeEnum, CreateBillingPlanApi } from '@/types';

export const billingPlans: CreateBillingPlanApi[] = [
  {
    title: 'Abonnement Mensuel',
    price: 0.99,
    description:
      "Découvrez l'exclusivité avec notre abonnement Premium mensuel à 0,99 € pour IGGY. Adieu publicités, bonjour fonctionnalités avancées, stockage illimité, et un support dédié. Essayez gratuitement, puis plongez dans une expérience sans égale. Téléchargez IGGY dès maintenant ! 🚀",
    type: BillingPlanTypeEnum.MONTHLY,
  },
  {
    title: 'Abonnement à vie',
    price: 10,
    description:
      "Profitez d'une expérience sans limites avec notre abonnement à vie pour IGGY, disponible pour un investissement unique de 10 €. Dites adieu aux publicités, accédez à des fonctionnalités exclusives en permanence, bénéficiez d'un stockage cloud illimité et d'un support premium à vie. Essayez gratuitement avant de faire le grand saut. Téléchargez IGGY dès maintenant pour une expérience Premium à vie ! 🚀",
    type: BillingPlanTypeEnum.FOR_LIFE,
  },
];
