import { BaseDto } from './BaseDto';

export enum BillingPlanTypeEnum {
  FREE = 'FREE',
  PREMIUM = 'PREMIUM',
}

export interface BillingPlanDto extends BaseDto {
  title: string;
  description: string;
  price: number;
  type: BillingPlanTypeEnum;
}
