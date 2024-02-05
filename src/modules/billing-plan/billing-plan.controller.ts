import {
  BadRequestException,
  Controller,
  Get,
  HttpCode,
  Inject,
  Param,
  UseGuards,
  forwardRef,
} from '@nestjs/common';
import { BillingPlanService } from '../billing-plan/billing-plan.service';
import { ApiKeyGuard } from '@/decorators/api-key.decorator';
import { BillingPlanTypeEnum } from '@/types';
import { errorMessage } from '@/errors';

@Controller('billing-plans')
export class BillingPlanController {
  constructor(
    @Inject(forwardRef(() => BillingPlanService))
    private readonly service: BillingPlanService,
  ) {}

  @Get()
  @HttpCode(200)
  @UseGuards(ApiKeyGuard)
  async getBillingPlans() {
    try {
      const billingPlans = await this.service.getBillingPlans();
      return billingPlans.map((billingPlan) =>
        this.service.formatBillingPlan(billingPlan),
      );
    } catch (e) {
      throw new BadRequestException(e);
    }
  }

  @Get(':type')
  @HttpCode(200)
  @UseGuards(ApiKeyGuard)
  async getBillingPlanByType(@Param('type') type: BillingPlanTypeEnum) {
    try {
      if (BillingPlanTypeEnum[type] === undefined)
        throw new BadRequestException(
          errorMessage.api('billingPlan').NOT_FOUND,
        );
      const billingPlans = await this.service.getBillingPlanByType(type);
      return this.service.formatBillingPlan(billingPlans);
    } catch (e) {
      throw new BadRequestException(e);
    }
  }
}
