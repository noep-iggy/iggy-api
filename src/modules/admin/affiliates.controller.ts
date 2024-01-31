import { ApiKeyGuard } from '@/decorators/api-key.decorator';
import { GetCurrentUser } from '@/decorators/get-current-user.decorator';
import { GetSearchParams } from '@/decorators/get-search-params.decorator';
import { errorMessage } from '@/errors';
import { CreateAffiliateApi, SearchParams, UpdateAffiliateApi } from '@/types';
import { affiliateValidation } from '@/validations';
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
import { ApiBearerAuth } from '@nestjs/swagger';
import { AffiliateService } from '../affiliate/affiliate.service';
import { User } from '../user/user.entity';

@Controller('admin')
export class AdminAffiliatesController {
  constructor(private readonly service: AffiliateService) {}

  @Get('affiliates')
  @HttpCode(200)
  @UseGuards(ApiKeyGuard)
  @ApiBearerAuth()
  async getAffiliates(
    @GetCurrentUser() user: User,
    @GetSearchParams() searchParams: SearchParams,
  ) {
    try {
      if (!user.isAdmin)
        throw new BadRequestException(errorMessage.api('admin').NOT_ADMIN);
      const affiliates = await this.service.getAffiliates(searchParams);
      return affiliates.items.map((affiliate) =>
        this.service.formatAffiliate(affiliate),
      );
    } catch (e) {
      throw new BadRequestException(e);
    }
  }

  @Post('affiliates')
  @HttpCode(201)
  @UseGuards(ApiKeyGuard)
  @ApiBearerAuth()
  async createBillingPlan(
    @Body() body: CreateAffiliateApi,
    @GetCurrentUser() user: User,
  ) {
    try {
      if (!user.isAdmin)
        throw new BadRequestException(errorMessage.api('admin').NOT_ADMIN);
      await affiliateValidation.create.validate(body, {
        abortEarly: false,
      });
      const affiliate = await this.service.createAffiliate(body);
      return this.service.formatAffiliate(affiliate);
    } catch (e) {
      throw new BadRequestException(e);
    }
  }

  @Patch('affiliates/:id')
  @HttpCode(200)
  @UseGuards(ApiKeyGuard)
  @ApiBearerAuth()
  async updateBillingPlan(
    @Param('id') id: string,
    @Body() body: UpdateAffiliateApi,
    @GetCurrentUser() user: User,
  ) {
    try {
      if (!user.isAdmin)
        throw new BadRequestException(errorMessage.api('admin').NOT_ADMIN);
      await affiliateValidation.update.validate(body, {
        abortEarly: false,
      });
      const billingPlan = await this.service.updateAffiliate(id, body);
      return this.service.formatAffiliate(billingPlan);
    } catch (e) {
      throw new BadRequestException(e);
    }
  }

  @Delete('affiliates/:id')
  @HttpCode(200)
  @UseGuards(ApiKeyGuard)
  @ApiBearerAuth()
  async deleteBillingPlan(
    @Param('id') id: string,
    @GetCurrentUser() user: User,
  ) {
    try {
      if (!user.isAdmin)
        throw new BadRequestException(errorMessage.api('admin').NOT_ADMIN);
      await this.service.deleteAffiliate(id);
    } catch (e) {
      throw new BadRequestException(e);
    }
  }
}
