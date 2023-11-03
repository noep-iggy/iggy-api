import { BaseDto } from './BaseDto';
import { BillingPlanTypeEnum } from './BillingPlan';
import { JoinCodeDto } from './Joincode';

export interface HouseDto extends BaseDto {
  name: string;
  users: string[];
  joinCode: JoinCodeDto;
  animals: string[];
  billingPlan: BillingPlanTypeEnum;
}
