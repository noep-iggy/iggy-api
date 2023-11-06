import { CreateBillingPlanApi, BillingPlanTypeEnum } from '@/types';

export const billingPlans: CreateBillingPlanApi[] = [
  {
    title: 'FREE',
    price: 0,
    description: 'Free plan',
    type: BillingPlanTypeEnum.FREE,
  },
  {
    title: 'PREMIUM',
    price: 10,
    description: 'Premium plan',
    type: BillingPlanTypeEnum.PREMIUM,
  },
];
