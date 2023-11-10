import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { HouseService } from './house.service';
import { ApiKeyGuard } from '@/decorators/api-key.decorator';
import { ApiBearerAuth } from '@nestjs/swagger';
import { GetCurrentUser } from '@/decorators/get-current-user.decorator';
import { BillingPlanTypeEnum, CreateHouseApi, UpdateHouseApi } from '@/types';
import { User } from '../user/user.entity';
import { houseValidation } from '@/validations';
import { UserService } from '../user/user.service';
import { JoinCodeService } from '../join-code/join-code.service';
import { errorMessage } from '@/errors';
import { AnimalService } from '../animal/animal.service';
import { TaskService } from '../task/task.service';
import { AffiliateService } from '../affiliate/affiliate.service';
import { decryptObject } from '@/utils';
import { BillingPlanService } from '../billing-plan/billing-plan.service';

@Controller('house')
export class HouseController {
  constructor(
    private readonly service: HouseService,
    private readonly userService: UserService,
    private readonly joincodeService: JoinCodeService,
    private readonly animalService: AnimalService,
    private readonly taskService: TaskService,
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
      await houseValidation.create.validate(body, {
        abortEarly: false,
      });
      if (user.house) {
        throw new BadRequestException(
          errorMessage.api('house').ALREADY_CREATED,
        );
      }
      const billingPlan = await this.billingPlanService.getBillingPlanByType(
        BillingPlanTypeEnum.FREE,
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

      let users = user.house.users;
      if (body.userIds) {
        users = await Promise.all(
          body.userIds.map((userId) => this.userService.getUser(userId)),
        );
      }

      let animals = user.house.animals;
      if (body.animalIds) {
        animals = await Promise.all(
          body.animalIds.map((animalId) =>
            this.animalService.findOneById(animalId),
          ),
        );
      }

      const house = await this.service.updateHouse({
        ...user.house,
        ...body,
        users,
        animals,
      });
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
}
