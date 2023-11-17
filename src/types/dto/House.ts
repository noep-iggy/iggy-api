import { AnimalDto } from './Animal';
import { BaseDto } from './BaseDto';
import { BillingPlanTypeEnum } from './BillingPlan';
import { JoinCodeDto } from './Joincode';
import { UserDto } from './User';

export interface HouseDto extends BaseDto {
  name: string;
  users: UserDto[];
  joinCode: JoinCodeDto;
  animals: AnimalDto[];
  billingPlan: BillingPlanTypeEnum;
}
