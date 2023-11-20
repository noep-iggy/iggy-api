import { BaseDto } from './BaseDto';

export enum BillingPlanTypeEnum {
  MONTHLY = 'MONTHLY',
  FOR_LIFE = 'FOR_LIFE',
}

export interface BillingPlanDto extends BaseDto {
  title: string;
  description: string;
  price: number;
  type: BillingPlanTypeEnum;
}
