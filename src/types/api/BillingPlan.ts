import { BillingPlanTypeEnum } from '../dto';

export interface CreateBillingPlanApi {
  title: string;
  description: string;
  price: number;
  type: BillingPlanTypeEnum;
}

export interface UpdateBillingPlanApi {
  title?: string;
  description?: string;
  price?: number;
  type?: BillingPlanTypeEnum;
}
