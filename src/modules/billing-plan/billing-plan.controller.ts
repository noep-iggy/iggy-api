import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { BillingPlanService } from './billing-plan.service';
import { ApiKeyGuard } from '@/decorators/api-key.decorator';
import { ApiBearerAuth } from '@nestjs/swagger';
import {
  BillingPlanTypeEnum,
  CreateBillingPlanApi,
  UpdateBillingPlanApi,
} from '@/types';
import { errorMessage } from '@/errors';

@Controller('billing-plans')
export class BillingPlanController {
  constructor(private readonly service: BillingPlanService) {}

  @Get()
  @HttpCode(200)
  @UseGuards(ApiKeyGuard)
  @ApiBearerAuth()
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
  @ApiBearerAuth()
  async getBillingPlanByType(@Param('type') type: BillingPlanTypeEnum) {
    try {
      const billingPlans = await this.service.getBillingPlanByType(type);
      return this.service.formatBillingPlan(billingPlans);
    } catch (e) {
      throw new BadRequestException(e);
    }
  }

  @Post()
  @HttpCode(201)
  @UseGuards(ApiKeyGuard)
  @ApiBearerAuth()
  async createBillingPlan(@Body() body: CreateBillingPlanApi) {
    try {
      const billingPlan = await this.service.createBillingPlan(body);
      return this.service.formatBillingPlan(billingPlan);
    } catch (e) {
      throw new BadRequestException(e);
    }
  }

  @Patch(':type')
  @HttpCode(200)
  @UseGuards(ApiKeyGuard)
  @ApiBearerAuth()
  async updateBillingPlan(
    @Param('type') type: BillingPlanTypeEnum,
    @Body() body: UpdateBillingPlanApi,
  ) {
    try {
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

  @Delete(':type')
  @HttpCode(200)
  @UseGuards(ApiKeyGuard)
  @ApiBearerAuth()
  async deleteBillingPlan(@Param('type') type: BillingPlanTypeEnum) {
    try {
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
