import { errorMessage } from '@/errors';
import {
  BillingPlanTypeEnum,
  CreateHouseApi,
  HouseDto,
  SearchParams,
  UpdateHouseApi,
} from '@/types';
import { decryptObject, encryptObject } from '@/utils';
import {
  BadRequestException,
  Inject,
  Injectable,
  forwardRef,
} from '@nestjs/common';
import { FindManyOptions, Raw, Repository } from 'typeorm';
import { Animal } from '../animal/animal.entity';
import { AnimalService } from '../animal/animal.service';
import { BillingPlan } from '../billing-plan/billing-plan.entity';
import { BillingPlanService } from '../billing-plan/billing-plan.service';
import { JoinCodeService } from '../join-code/join-code.service';
import { User } from '../user/user.entity';
import { UserService } from '../user/user.service';
import { House } from './house.entity';
import { InjectRepository } from '@nestjs/typeorm';
@Injectable()
export class HouseService {
  constructor(
    @InjectRepository(House) private houseRepository: Repository<House>,
    private readonly joinCodeService: JoinCodeService,
    @Inject(forwardRef(() => BillingPlanService))
    private readonly billingPlanService: BillingPlanService,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    @Inject(forwardRef(() => AnimalService))
    private readonly animalService: AnimalService,
  ) {}

  formatHouse(houseCripted?: House): HouseDto {
    if (!houseCripted) return;
    const house = decryptObject(houseCripted);
    return {
      ...house,
      billingPlan: house?.billingPlan?.type,
      users: house?.users
        ? house.users.map((user) => this.userService.formatUser(user))
        : undefined,
      joinCode: this.joinCodeService.formatJoinCode(house?.joinCode),
      animals:
        house?.animals && house.animals.length > 0
          ? house.animals.map((animal) =>
              this.animalService.formatAnimal(animal),
            )
          : undefined,
    };
  }

  async getHouse(_id: string): Promise<House> {
    try {
      return await this.houseRepository.findOne({
        where: { id: _id },
        relations: ['users', 'animals', 'joinCode', 'billingPlan'],
      });
    } catch (error) {
      throw new BadRequestException(errorMessage.api('house').NOT_FOUND);
    }
  }

  async getHouses(searchParams: SearchParams): Promise<House[]> {
    try {
      const order = {
        [searchParams.orderBy ?? 'createdAt']: searchParams.orderType ?? 'DESC',
      };
      const conditions: FindManyOptions<House> = {
        where: {
          name: Raw(
            (alias) =>
              `LOWER(${alias}) Like '%${searchParams.search?.toLowerCase()}%'`,
          ),
        },
        relations: ['users', 'animals', 'joinCode', 'billingPlan'],
        order: {
          ...order,
          users: {
            firstName: searchParams.orderType ?? 'DESC',
          },
          animals: {
            name: searchParams.orderType ?? 'DESC',
          },
          billingPlan: {
            type: searchParams.orderType ?? 'DESC',
          },
        },
        skip: searchParams.page * searchParams.pageSize,
        take: searchParams.pageSize,
      };
      const houses = await this.houseRepository.find(conditions);
      return houses;
    } catch (error) {
      console.log(error);
      throw new BadRequestException(errorMessage.api('house').NOT_FOUND);
    }
  }

  async createHouse(body: CreateHouseApi, user: User): Promise<House> {
    try {
      const { name, ...rest } = body;
      const encryptHouse = encryptObject(rest);
      const house = await this.houseRepository.save({
        ...encryptHouse,
        name,
        users: [user],
      });
      await this.billingPlanService.addHouseToBillingPlan(
        BillingPlanTypeEnum.FREE,
        house.id,
      );
      return house;
    } catch (error) {
      console.log(error);
      throw new BadRequestException(errorMessage.api('house').NOT_CREATED);
    }
  }

  async updateHouse(body: UpdateHouseApi, houseId: string): Promise<House> {
    try {
      const house = await this.getHouse(houseId);
      let users: User[];
      if (body.userIds) {
        users = await Promise.all(
          body.userIds.map((userId) => this.userService.getUser(userId)),
        );
      }

      let animals: Animal[];
      if (body.animalIds) {
        animals = await Promise.all(
          body.animalIds.map((animalId) =>
            this.animalService.findOneById(animalId),
          ),
        );
      }

      let billingPlan: BillingPlan;
      if (body.billingPlan) {
        billingPlan = await this.billingPlanService.getBillingPlanByType(
          body.billingPlan,
        );
      }

      const { name, ...rest } = body;
      const encryptHouse = encryptObject(rest);
      await this.houseRepository.save({
        ...house,
        ...encryptHouse,
        name: name ?? house.name,
        users: users ?? house.users,
        animals: animals ?? house.animals,
        billingPlan: billingPlan ?? house.billingPlan,
      });
      return await this.getHouse(houseId);
    } catch (error) {
      console.log(error);
      throw new BadRequestException(errorMessage.api('house').NOT_UPDATED);
    }
  }

  async findHouseByCode(code: string): Promise<House> {
    try {
      const house = await this.houseRepository.findOne({
        where: {
          joinCode: {
            code: code,
          },
        },
      });
      return house;
    } catch (error) {
      console.log(error);
      throw new BadRequestException(errorMessage.api('house').NOT_FOUND);
    }
  }

  async findUserByNameInHouse(
    firstName: string,
    houseId: string,
  ): Promise<User> {
    try {
      const users = await this.houseRepository.findOne({
        where: {
          id: houseId,
        },
        relations: ['users'],
      });
      const user = users.users.find((user) => user.firstName === firstName);
      return user;
    } catch (error) {
      console.log(error);
      throw new BadRequestException(errorMessage.api('house').NOT_FOUND);
    }
  }

  async addUserToHouse(user: User, house: House): Promise<House> {
    try {
      return await this.houseRepository.save({
        ...house,
        users: [...house.users, user],
      });
    } catch (error) {
      console.log(error);
      throw new BadRequestException(errorMessage.api('house').NOT_UPDATED);
    }
  }

  async addAnimalToHouse(animal: Animal, house: House): Promise<House> {
    try {
      const completeHouse = await this.getHouse(house.id);
      return await this.houseRepository.save({
        ...house,
        animals: [...completeHouse.animals, animal],
      });
    } catch (error) {
      console.log(error);
      throw new BadRequestException(errorMessage.api('house').NOT_UPDATED);
    }
  }

  async deleteHouse(id: string): Promise<void> {
    try {
      const users = await this.userService.findUsersByHouseId(id);
      await Promise.all(
        users.map(async (user) => {
          await this.userService.deleteUser(user.id);
        }),
      );
      const animals = await this.animalService.findAnimalsByHouseId(id);
      await Promise.all(
        animals.map(async (animal) => {
          await this.animalService.deleteAnimal(animal.id);
        }),
      );
      await this.houseRepository.delete(id);
    } catch (error) {
      console.log(error);
      throw new BadRequestException(errorMessage.api('house').NOT_DELETED);
    }
  }
}
