import { BadRequestException, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { House } from './house.entity';
import { BillingPlanTypeEnum, CreateHouseApi, HouseDto } from '@/types';
import { decryptObject, encryptObject } from '@/utils';
import { User } from '../user/user.entity';
import { errorMessage } from '@/errors';
import { JoinCodeService } from '../join-code/join-code.service';
import { Animal } from '../animal/animal.entity';
import { BillingPlanService } from '../billing-plan/billing-plan.service';
import { InjectRepository } from '@nestjs/typeorm';
@Injectable()
export class HouseService {
  constructor(
    @InjectRepository(House) private houseRepository: Repository<House>,
    private readonly joinCodeService: JoinCodeService,
    private readonly billingPlanService: BillingPlanService,
  ) {}

  formatHouse(houseCripted?: House): HouseDto {
    if (!houseCripted) return;
    const house = decryptObject(houseCripted);
    return {
      ...house,
      billingPlan: house?.billingPlan?.type,
      users: house?.users ? house.users.map((user) => user.id) : undefined,
      joinCode: this.joinCodeService.formatJoinCode(house?.joinCode),
      animals:
        house?.animals && house.animals.length > 0
          ? house.animals.map((animal) => animal.id)
          : undefined,
    };
  }

  async getHouse(_id: string): Promise<House> {
    try {
      return await this.houseRepository.findOne({
        where: { id: _id },
        relations: ['users', 'animals', 'joinCode', 'billingPlan'],
        select: {
          users: {
            id: true,
          },
          animals: {
            id: true,
          },
          billingPlan: {
            type: true,
          },
        },
      });
    } catch (error) {
      throw new BadRequestException(errorMessage.api('house').NOT_FOUND);
    }
  }

  async getHouses(): Promise<House[]> {
    try {
      return await this.houseRepository.find();
    } catch (error) {
      throw new BadRequestException(errorMessage.api('house').NOT_FOUND);
    }
  }

  async createHouse(body: CreateHouseApi, user: User): Promise<House> {
    try {
      const encryptHouse = encryptObject(body);
      const house = await this.houseRepository.save({
        ...encryptHouse,
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

  async updateHouse(body: House): Promise<House> {
    try {
      const { name } = body;
      const encryptHouse = encryptObject({ name });
      const house = await this.houseRepository.save({
        ...body,
        ...encryptHouse,
        updatedAt: new Date(),
      });

      return house;
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
    userName: string,
    houseId: string,
  ): Promise<User> {
    try {
      const users = await this.houseRepository.findOne({
        where: {
          id: houseId,
        },
        relations: ['users'],
      });
      const user = users.users.find((user) => user.userName === userName);
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
      const house = await this.getHouse(id);
      await this.houseRepository.remove(house);
    } catch (error) {
      throw new BadRequestException(errorMessage.api('house').NOT_DELETED);
    }
  }
}
