import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  HttpCode,
  Inject,
  Param,
  Patch,
  Post,
  UseGuards,
  forwardRef,
} from '@nestjs/common';
import { BillingPlanService } from '../billing-plan/billing-plan.service';
import { ApiKeyGuard } from '@/decorators/api-key.decorator';
import { ApiBearerAuth } from '@nestjs/swagger';
import {
  BillingPlanTypeEnum,
  CreateBillingPlanApi,
  UpdateBillingPlanApi,
} from '@/types';
import { errorMessage } from '@/errors';
import { billingPlanValidation } from '@/validations';
import { GetCurrentUser } from '@/decorators/get-current-user.decorator';
import { User } from '../user/user.entity';

@Controller('admin')
export class AdminBillingPlanController {
  constructor(
    @Inject(forwardRef(() => BillingPlanService))
    private readonly service: BillingPlanService,
  ) {}

  @Post('billing-plans')
  @HttpCode(201)
  @UseGuards(ApiKeyGuard)
  @ApiBearerAuth()
  async createBillingPlan(
    @Body() body: CreateBillingPlanApi,
    @GetCurrentUser() user: User,
  ) {
    try {
      if (!user.isAdmin)
        throw new BadRequestException(errorMessage.api('admin').NOT_ADMIN);
      await billingPlanValidation.create.validate(body, {
        abortEarly: false,
      });
      const billingPlan = await this.service.createBillingPlan(body);
      return this.service.formatBillingPlan(billingPlan);
    } catch (e) {
      throw new BadRequestException(e);
    }
  }

  @Patch('billing-plans/:type')
  @HttpCode(200)
  @UseGuards(ApiKeyGuard)
  @ApiBearerAuth()
  async updateBillingPlan(
    @Param('type') type: BillingPlanTypeEnum,
    @Body() body: UpdateBillingPlanApi,
    @GetCurrentUser() user: User,
  ) {
    try {
      if (!user.isAdmin)
        throw new BadRequestException(errorMessage.api('admin').NOT_ADMIN);
      await billingPlanValidation.update.validate(body, {
        abortEarly: false,
      });
      if (BillingPlanTypeEnum[type] === undefined)
        throw new BadRequestException(
          errorMessage.api('billingPlan').NOT_FOUND,
        );
      const billingPlan = await this.service.updateBillingPlan(type, body);
      return this.service.formatBillingPlan(billingPlan);
    } catch (e) {
      throw new BadRequestException(e);
    }
  }

  @Delete('billing-plans/:type')
  @HttpCode(200)
  @UseGuards(ApiKeyGuard)
  @ApiBearerAuth()
  async deleteBillingPlan(
    @Param('type') type: BillingPlanTypeEnum,
    @GetCurrentUser() user: User,
  ) {
    try {
      if (!user.isAdmin)
        throw new BadRequestException(errorMessage.api('admin').NOT_ADMIN);
      if (BillingPlanTypeEnum[type] === undefined)
        throw new BadRequestException(
          errorMessage.api('billingPlan').NOT_FOUND,
        );
      await this.service.deleteBillingPlan(type);
    } catch (e) {
      throw new BadRequestException(e);
    }
  }
}
