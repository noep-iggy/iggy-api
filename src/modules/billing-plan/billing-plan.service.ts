import {
  BadRequestException,
  Inject,
  Injectable,
  forwardRef,
} from '@nestjs/common';
import { BillingPlan } from './billing-plan.entity';
import { Repository } from 'typeorm';
import {
  BillingPlanDto,
  BillingPlanTypeEnum,
  CreateBillingPlanApi,
} from '@/types';
import { errorMessage } from '@/errors';
import { HouseService } from '../house/house.service';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class BillingPlanService {
  constructor(
    @InjectRepository(BillingPlan)
    private billingPlanRepository: Repository<BillingPlan>,
    @Inject(forwardRef(() => HouseService))
    private readonly houseService: HouseService,
  ) {}

  formatBillingPlan(billingPlan: BillingPlan): BillingPlanDto {
    if (!billingPlan) return;
    return {
      ...billingPlan,
    };
  }

  async createBillingPlan(body: CreateBillingPlanApi): Promise<BillingPlan> {
    try {
      const possibleBillingPlan = await this.billingPlanRepository.findOne({
        where: { type: body.type },
      });
      if (possibleBillingPlan) {
        throw new BadRequestException(
          errorMessage.api('billingPlan').ALREADY_CREATED,
        );
      }
      const billingPlan = await this.billingPlanRepository.save(body);
      return billingPlan;
    } catch (error) {
      console.log(error);
      throw new BadRequestException(errorMessage.api('billingPlan').NOT_FOUND);
    }
  }

  async getBillingPlanByType(type: BillingPlanTypeEnum): Promise<BillingPlan> {
    try {
      return await this.billingPlanRepository.findOne({
        where: { type: type },
      });
    } catch (error) {
      console.log(error);
      throw new BadRequestException(errorMessage.api('billingPlan').NOT_FOUND);
    }
  }

  async getBillingPlans(): Promise<BillingPlan[]> {
    try {
      return await this.billingPlanRepository.find();
    } catch (error) {
      console.log(error);
      throw new BadRequestException(errorMessage.api('billingPlan').NOT_FOUND);
    }
  }

  async updateBillingPlan(
    type: BillingPlanTypeEnum,
    body: Partial<BillingPlan>,
  ): Promise<BillingPlan> {
    try {
      const billingPlan = await this.billingPlanRepository.findOne({
        where: { type: type },
      });
      const billingPlanUpdated = await this.billingPlanRepository.save({
        ...billingPlan,
        ...body,
      });
      return billingPlanUpdated;
    } catch (error) {
      console.log(error);
      throw new BadRequestException(errorMessage.api('billingPlan').NOT_FOUND);
    }
  }

  async addHouseToBillingPlan(
    type: BillingPlanTypeEnum,
    houseId: string,
  ): Promise<void> {
    try {
      const billingPlan = await this.billingPlanRepository.findOne({
        where: { type: type },
        relations: ['houses'],
      });
      const house = await this.houseService.getHouse(houseId);
      billingPlan.houses.push(house);
      await this.billingPlanRepository.save(billingPlan);
    } catch (error) {
      console.log(error);
      throw new BadRequestException(errorMessage.api('billingPlan').NOT_FOUND);
    }
  }

  async deleteBillingPlan(type: BillingPlanTypeEnum): Promise<void> {
    try {
      const billingPlan = await this.billingPlanRepository.findOne({
        where: { type: type },
      });
      await this.billingPlanRepository.delete(billingPlan.id);
    } catch (error) {
      console.log(error);
      throw new BadRequestException(errorMessage.api('billingPlan').NOT_FOUND);
    }
  }
}
