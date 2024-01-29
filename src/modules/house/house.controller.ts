import { ApiKeyGuard } from '@/decorators/api-key.decorator';
import { GetCurrentUser } from '@/decorators/get-current-user.decorator';
import { errorMessage } from '@/errors';
import { BillingPlanTypeEnum, CreateHouseApi, UpdateHouseApi } from '@/types';
import { decryptObject } from '@/utils';
import { houseValidation } from '@/validations';
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Inject,
  Patch,
  Post,
  UseGuards,
  forwardRef,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AffiliateService } from '../affiliate/affiliate.service';
import { AnimalService } from '../animal/animal.service';
import { BillingPlanService } from '../billing-plan/billing-plan.service';
import { JoinCodeService } from '../join-code/join-code.service';
import { User } from '../user/user.entity';
import { UserService } from '../user/user.service';
import { HouseService } from './house.service';

@Controller('house')
export class HouseController {
  constructor(
    @Inject(forwardRef(() => HouseService))
    private readonly service: HouseService,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    private readonly joincodeService: JoinCodeService,
    @Inject(forwardRef(() => AnimalService))
    private readonly animalService: AnimalService,
    private readonly affiliateService: AffiliateService,
    private readonly billingPlanService: BillingPlanService,
  ) {}

  @Post()
  @HttpCode(201)
  @UseGuards(ApiKeyGuard)
  @ApiBearerAuth()
  async createHouse(
    @Body() body: CreateHouseApi,
    @GetCurrentUser() user: User,
  ) {
    try {
      console.log('[D] house.controller', user);
      await houseValidation.create.validate(body, {
        abortEarly: false,
      });
      if (user.house) {
        throw new BadRequestException(
          errorMessage.api('house').ALREADY_CREATED,
        );
      }
      const billingPlan = await this.billingPlanService.getBillingPlanByType(
        BillingPlanTypeEnum.MONTHLY,
      );
      if (!billingPlan) {
        throw new BadRequestException(
          errorMessage.api('billingPlan').NOT_FOUND,
        );
      }

      const house = await this.service.createHouse(body, user);
      return this.service.formatHouse(house);
    } catch (e) {
      throw new BadRequestException(e);
    }
  }

  @Get()
  @HttpCode(200)
  @UseGuards(ApiKeyGuard)
  @ApiBearerAuth()
  async getHouse(@GetCurrentUser() user: User) {
    if (!user.house)
      throw new BadRequestException(errorMessage.api('house').NOT_FOUND);
    const house = await this.service.getHouse(user.house.id);
    return this.service.formatHouse({ ...house });
  }

  @Patch()
  @HttpCode(200)
  @UseGuards(ApiKeyGuard)
  @ApiBearerAuth()
  async updateHouse(
    @Body() body: UpdateHouseApi,
    @GetCurrentUser() user: User,
  ) {
    try {
      await houseValidation.update.validate(body, {
        abortEarly: false,
      });

      const house = await this.service.updateHouse(body, user.house.id);
      return this.service.formatHouse(house);
    } catch (e) {
      throw new BadRequestException(e.errors);
    }
  }

  @Get('users')
  @HttpCode(200)
  @UseGuards(ApiKeyGuard)
  @ApiBearerAuth()
  async getUsers(@GetCurrentUser() user: User) {
    if (!user.house)
      throw new BadRequestException(errorMessage.api('house').NOT_FOUND);
    const users = await this.userService.findUsersByHouseId(user.house.id);
    return users.map((user) => this.userService.formatUser(user));
  }

  @Get('join-code')
  @HttpCode(200)
  @UseGuards(ApiKeyGuard)
  @ApiBearerAuth()
  async getJoinCodes(@GetCurrentUser() user: User) {
    if (!user.house)
      throw new BadRequestException(errorMessage.api('house').NOT_FOUND);
    const joinCode = await this.joincodeService.findJoincodeByHouseId(
      user.house.id,
    );
    return this.joincodeService.formatJoinCode(joinCode);
  }

  @Get('animals')
  @HttpCode(200)
  @UseGuards(ApiKeyGuard)
  @ApiBearerAuth()
  async getAnimals(@GetCurrentUser() user: User) {
    if (!user.house)
      throw new BadRequestException(errorMessage.api('house').NOT_FOUND);
    const animals = await this.animalService.findAnimalsByHouseId(
      user.house.id,
    );
    return animals.map((animal) => this.animalService.formatAnimal(animal));
  }

  @Get('affiliates')
  @HttpCode(200)
  @UseGuards(ApiKeyGuard)
  @ApiBearerAuth()
  async getAffiliates(@GetCurrentUser() user: User) {
    if (!user.house)
      throw new BadRequestException(errorMessage.api('house').NOT_FOUND);
    const animals = await this.animalService.findAnimalsByHouseId(
      user.house.id,
    );

    const affiliates = await Promise.all(
      animals.map(async (animal) => {
        const animalDecrypted = decryptObject(animal);
        return await this.affiliateService.getAffiliateByAnimalType(
          animalDecrypted.type,
        );
      }),
    );

    return affiliates
      .flat()
      .filter((affiliate, index, self) => {
        return (
          index ===
          self.findIndex(
            (t) => t.id === affiliate.id && t.title === affiliate.title,
          )
        );
      })
      .map((affiliate) => this.affiliateService.formatAffiliate(affiliate));
  }

  @Delete()
  @HttpCode(204)
  @UseGuards(ApiKeyGuard)
  @ApiBearerAuth()
  async deleteHouse(@GetCurrentUser() user: User) {
    if (!user.house)
      throw new BadRequestException(errorMessage.api('house').NOT_FOUND);
    await this.service.deleteHouse(user.house.id);
  }
}
