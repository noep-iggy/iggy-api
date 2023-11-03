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
import { AffiliateService } from './affiliate.service';
import { ApiKeyGuard } from '@/decorators/api-key.decorator';
import { ApiBearerAuth } from '@nestjs/swagger';
import {
  AnimalTypeEnum,
  CreateAffiliateApi,
  UpdateAffiliateApi,
} from '@/types';
import { errorMessage } from '@/errors';
import { affiliateValidation } from '@/validations';

@Controller('affiliates')
export class AffiliateController {
  constructor(private readonly service: AffiliateService) {}

  @Get()
  @HttpCode(200)
  @UseGuards(ApiKeyGuard)
  @ApiBearerAuth()
  async getAffiliates() {
    try {
      const affiliates = await this.service.getAffiliates();
      return affiliates.map((affiliate) =>
        this.service.formatAffiliate(affiliate),
      );
    } catch (e) {
      throw new BadRequestException(e);
    }
  }

  @Get(':animalType')
  @HttpCode(200)
  @UseGuards(ApiKeyGuard)
  @ApiBearerAuth()
  async getAffiliateByAnimalType(
    @Param('animalType') animalType: AnimalTypeEnum,
  ) {
    try {
      if (AnimalTypeEnum[animalType] === undefined)
        throw new BadRequestException(
          errorMessage.api('billingPlan').NOT_FOUND,
        );
      const affiliates =
        await this.service.getAffiliateByAnimalType(animalType);
      return affiliates.map((affiliate) =>
        this.service.formatAffiliate(affiliate),
      );
    } catch (e) {
      throw new BadRequestException(e);
    }
  }

  @Post()
  @HttpCode(201)
  @UseGuards(ApiKeyGuard)
  @ApiBearerAuth()
  async createBillingPlan(@Body() body: CreateAffiliateApi) {
    try {
      await affiliateValidation.create.validate(body, {
        abortEarly: false,
      });
      const affiliate = await this.service.createAffiliate(body);
      return this.service.formatAffiliate(affiliate);
    } catch (e) {
      throw new BadRequestException(e);
    }
  }

  @Patch(':id')
  @HttpCode(200)
  @UseGuards(ApiKeyGuard)
  @ApiBearerAuth()
  async updateBillingPlan(
    @Param('id') id: string,
    @Body() body: UpdateAffiliateApi,
  ) {
    try {
      await affiliateValidation.update.validate(body, {
        abortEarly: false,
      });
      const billingPlan = await this.service.updateAffiliate(id, body);
      return this.service.formatAffiliate(billingPlan);
    } catch (e) {
      throw new BadRequestException(e);
    }
  }

  @Delete(':id')
  @HttpCode(200)
  @UseGuards(ApiKeyGuard)
  @ApiBearerAuth()
  async deleteBillingPlan(@Param('id') id: string) {
    try {
      await this.service.deleteAffiliate(id);
    } catch (e) {
      throw new BadRequestException(e);
    }
  }
}
