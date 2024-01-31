import { ApiKeyGuard } from '@/decorators/api-key.decorator';
import { GetSearchParams } from '@/decorators/get-search-params.decorator';
import {
  AffiliateDto,
  AffiliateSearchParams,
  ApiSearchResponse,
} from '@/types';
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

  @Get('search/brands')
  @HttpCode(200)
  @UseGuards(ApiKeyGuard)
  @ApiBearerAuth()
  async getBrandsOfAffiliates() {
    try {
      return await this.service.getBrandsOfAffiliates();
    } catch (e) {
      throw new BadRequestException(e);
    }
  }

  @Get()
  @HttpCode(200)
  @UseGuards(ApiKeyGuard)
  @ApiBearerAuth()
  async getAffiliates(
    @GetSearchParams<AffiliateSearchParams>()
    searchParams: AffiliateSearchParams,
  ): Promise<ApiSearchResponse<AffiliateDto>> {
    try {
      const affiliates = await this.service.getAffiliates(searchParams);
      return {
        ...affiliates,
        items: affiliates.items.map((affiliate) =>
          this.service.formatAffiliate(affiliate),
        ),
      };
    } catch (e) {
      throw new BadRequestException(e);
    }
  }
}
