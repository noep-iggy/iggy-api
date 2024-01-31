import { errorMessage } from '@/errors';
import {
  AffiliateDto,
  AffiliateSearchParams,
  ApiSearchResponse,
  CreateAffiliateApi,
  UpdateAffiliateApi,
} from '@/types';
import { BadRequestException, Injectable } from '@nestjs/common';
import { FindManyOptions, Raw, Repository } from 'typeorm';
import { Media } from '../media/media.entity';
import { MediaService } from '../media/media.service';
import { Affiliate } from './affiliate.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class AffiliateService {
  constructor(
    @InjectRepository(Affiliate)
    private affiliateRepository: Repository<Affiliate>,
    private mediaService: MediaService,
  ) {}

  formatAffiliate(affiliate: Affiliate): AffiliateDto {
    if (!affiliate) return;
    return {
      ...affiliate,
    };
  }

  searchConditions(
    searchParams?: AffiliateSearchParams,
  ): FindManyOptions<Affiliate> {
    if (!searchParams) return {};

    const where = {
      title: Raw(
        (alias) =>
          `LOWER(${alias}) LIKE '%${searchParams.search.toLowerCase()}%'`,
      ),
      animals: searchParams.animalTypes
        ? Raw((alias) => {
            const animalConditions = searchParams.animalTypes
              .map((animal) => `${alias} LIKE '%${animal}%'`)
              .join(' OR ');
            return `(${animalConditions})`;
          })
        : undefined,
      brand: searchParams.brands
        ? Raw((alias) => {
            const brandConditions = searchParams.brands
              .map((brand) => `${alias} LIKE '%${brand}%'`)
              .join(' OR ');
            return `(${brandConditions})`;
          })
        : undefined,
      discountPrice: Raw(
        (alias) =>
          `${alias} BETWEEN ${searchParams.minPrice ?? 0} AND ${
            searchParams.maxPrice ?? 999999
          }`,
      ),
    };

    if (searchParams.animalTypes && searchParams.animalTypes.length > 0) {
      where.animals = Raw((alias) => {
        const animalConditions = searchParams.animalTypes
          .map((animal) => `${alias} LIKE '%${animal}%'`)
          .join(' OR ');
        return `(${animalConditions})`;
      });
    }

    const order = {
      [searchParams.orderBy ?? 'createdAt']: searchParams.orderType ?? 'DESC',
    };

    return {
      where,
      order,
      relations: ['image'],
      skip: searchParams.page * searchParams.pageSize,
      take: searchParams.pageSize,
    };
  }

  async getAffiliates(
    searchParams?: AffiliateSearchParams,
  ): Promise<ApiSearchResponse<Affiliate>> {
    try {
      const [affiliates, total] = await this.affiliateRepository.findAndCount(
        this.searchConditions(searchParams),
      );
      return {
        items: affiliates,
        total,
        page: searchParams.page,
      };
    } catch (error) {
      console.log(error);
      throw new BadRequestException(errorMessage.api('affiliate').NOT_FOUND);
    }
  }

  async getBrandsOfAffiliates(): Promise<string[]> {
    try {
      const affiliates = await this.affiliateRepository.find();
      const brands = affiliates.map((affiliate) => affiliate.brand);
      return [...new Set(brands)];
    } catch (error) {
      console.log(error);
      throw new BadRequestException(errorMessage.api('affiliate').NOT_FOUND);
    }
  }

  async getAffiliateById(id: string): Promise<Affiliate> {
    try {
      const affiliate = await this.affiliateRepository.findOne({
        where: { id: id },
      });
      if (!affiliate) {
        throw new BadRequestException(errorMessage.api('affiliate').NOT_FOUND);
      }
      return affiliate;
    } catch (error) {
      console.log(error);
      throw new BadRequestException(errorMessage.api('affiliate').NOT_FOUND);
    }
  }

  async createAffiliate(body: CreateAffiliateApi): Promise<Affiliate> {
    try {
      let image: Media = undefined;
      if (body.image) {
        image = await this.mediaService.getMediaById(body.image);
      }
      const affiliate = await this.affiliateRepository.save({
        ...body,
        image: image,
      });
      return affiliate;
    } catch (error) {
      console.log(error);
      throw new BadRequestException(errorMessage.api('affiliate').NOT_FOUND);
    }
  }

  async updateAffiliate(
    id: string,
    body: UpdateAffiliateApi,
  ): Promise<Affiliate> {
    try {
      const affiliate = await this.affiliateRepository.findOne({
        where: { id: id },
      });
      if (!affiliate) {
        throw new BadRequestException(errorMessage.api('affiliate').NOT_FOUND);
      }
      let image;
      if (body.image) {
        image = await this.mediaService.getMediaById(body.image);
      }
      const updatedAffiliate = await this.affiliateRepository.save({
        ...affiliate,
        ...body,
        image: image ?? affiliate.image,
      });

      if (body.image && affiliate.image) {
        await this.mediaService.deleteMedia(affiliate.image.id);
      }
      return updatedAffiliate;
    } catch (error) {
      console.log(error);
      throw new BadRequestException(errorMessage.api('affiliate').NOT_FOUND);
    }
  }

  async deleteAffiliate(id: string): Promise<void> {
    try {
      await this.affiliateRepository.delete(id);
    } catch (error) {
      console.log(error);
      throw new BadRequestException(errorMessage.api('affiliate').NOT_FOUND);
    }
  }
}
