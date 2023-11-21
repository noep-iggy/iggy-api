import { errorMessage } from '@/errors';
import {
  AffiliateDto,
  AnimalTypeEnum,
  CreateAffiliateApi,
  SearchParams,
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

  searchConditions(searchParams?: SearchParams): FindManyOptions<Affiliate> {
    if (!searchParams) return;
    const order = {
      [searchParams.orderBy ?? 'createdAt']: searchParams.orderType ?? 'DESC',
    };
    return {
      where: {
        title: Raw(
          (alias) =>
            `LOWER(${alias}) Like '%${searchParams.search?.toLowerCase()}%'`,
        ),
      },
      order,
      skip: searchParams.page * searchParams.pageSize,
      take: searchParams.pageSize,
    };
  }

  async getAffiliates(searchParams: SearchParams): Promise<Affiliate[]> {
    try {
      return await this.affiliateRepository.find(
        this.searchConditions(searchParams),
      );
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

  async getAffiliateByAnimalType(
    animalType: AnimalTypeEnum,
    searchParams?: SearchParams,
  ): Promise<Affiliate[]> {
    try {
      const affilatesAll = await this.getAffiliates(searchParams);
      const affilates = affilatesAll.filter((affiliate) =>
        affiliate.animals.includes(animalType),
      );
      return affilates;
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
