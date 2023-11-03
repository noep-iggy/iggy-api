import { BadRequestException, Injectable } from '@nestjs/common';
import { Affiliate } from './affiliate.entity';
import { Repository } from 'typeorm';
import {
  AffiliateDto,
  AnimalTypeEnum,
  CreateAffiliateApi,
  UpdateAffiliateApi,
} from '@/types';
import { errorMessage } from '@/errors';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class AffiliateService {
  constructor(
    @InjectRepository(Affiliate)
    private affiliateRepository: Repository<Affiliate>,
  ) {}

  formatAffiliate(affiliate: Affiliate): AffiliateDto {
    if (!affiliate) return;
    return {
      ...affiliate,
    };
  }

  async getAffiliates(): Promise<Affiliate[]> {
    try {
      return await this.affiliateRepository.find();
    } catch (error) {
      console.log(error);
      throw new BadRequestException(errorMessage.api('affiliate').NOT_FOUND);
    }
  }

  async getAffiliateByAnimalType(
    animalType: AnimalTypeEnum,
  ): Promise<Affiliate[]> {
    try {
      const affilatesAll = await this.affiliateRepository.find();
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
      const affiliate = await this.affiliateRepository.save(body);
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
      const updatedAffiliate = await this.affiliateRepository.save({
        ...affiliate,
        ...body,
      });
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
