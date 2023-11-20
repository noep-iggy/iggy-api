import { ApiKeyGuard } from '@/decorators/api-key.decorator';
import { GetSearchParams } from '@/decorators/get-search-params.decorator';
import { errorMessage } from '@/errors';
import { AnimalTypeEnum, SearchParams } from '@/types';
import {
  BadRequestException,
  Controller,
  Get,
  HttpCode,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AffiliateService } from './affiliate.service';

@Controller('affiliates')
export class AffiliateController {
  constructor(private readonly service: AffiliateService) {}

  @Get(':id')
  @HttpCode(200)
  @UseGuards(ApiKeyGuard)
  @ApiBearerAuth()
  async getAffiliateById(@Param('id') id: string) {
    try {
      const affiliate = await this.service.getAffiliateById(id);
      return this.service.formatAffiliate(affiliate);
    } catch (e) {
      throw new BadRequestException(e);
    }
  }

  @Get('type/:animalType')
  @HttpCode(200)
  @UseGuards(ApiKeyGuard)
  @ApiBearerAuth()
  async getAffiliateByAnimalType(
    @Param('animalType') animalType: AnimalTypeEnum,
    @GetSearchParams() searchParams: SearchParams,
  ) {
    try {
      if (AnimalTypeEnum[animalType] === undefined)
        throw new BadRequestException(errorMessage.api('affiliates').NOT_FOUND);
      const affiliates = await this.service.getAffiliateByAnimalType(
        animalType,
        searchParams,
      );
      return affiliates.map((affiliate) =>
        this.service.formatAffiliate(affiliate),
      );
    } catch (e) {
      console.log(e);
      throw new BadRequestException(e);
    }
  }
}
