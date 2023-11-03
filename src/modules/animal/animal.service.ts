import { HouseService } from './../house/house.service';
import { BadRequestException, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Animal } from './animal.entity';
import {
  AnimalDto,
  AnimalStatusEnum,
  CreateAnimalApi,
  UpdateAnimalApi,
} from '@/types';
import { decryptObject, encryptObject } from '@/utils';
import { errorMessage } from '@/errors';
import { User } from '../user/user.entity';
import { resolverAnimalStatus } from '@/utils/animal';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class AnimalService {
  constructor(
    @InjectRepository(Animal) private animalRepository: Repository<Animal>,
    private readonly houseService: HouseService,
  ) {}

  formatAnimal(animalCrypted: Animal): AnimalDto {
    if (!animalCrypted) return;
    const animal = decryptObject(animalCrypted);
    return {
      ...animal,
      tasks: animal.tasks ? animal.tasks.map((task) => task.id) : undefined,
    };
  }

  async createAnimal(body: CreateAnimalApi, user: User): Promise<Animal> {
    try {
      const { bornDate, ...animal } = body;
      const encryptAnimal = encryptObject({
        ...animal,
      });
      const animalUpdated = await this.animalRepository.save({
        ...encryptAnimal,
        bornDate: new Date(bornDate),
        status: AnimalStatusEnum.NORMAL,
      });
      await this.houseService.addAnimalToHouse(animalUpdated, user.house);
      return animalUpdated;
    } catch (error) {
      console.log(error);
      throw new BadRequestException(errorMessage.api('animal').NOT_CREATED);
    }
  }

  async findAnimalsByHouseId(houseId: string): Promise<Animal[]> {
    try {
      const animals = await this.animalRepository.find({
        where: { house: { id: houseId } },
      });
      return animals;
    } catch (error) {
      throw new BadRequestException(errorMessage.api('animal').NOT_FOUND);
    }
  }

  async findOneByName(name: string): Promise<Animal | null> {
    const animal = await this.animalRepository.findOne({
      where: [{ name }],
    });
    return animal;
  }

  async findOneById(id: string): Promise<Animal | null> {
    const animal = await this.animalRepository.findOne({
      where: [{ id }],
    });
    return animal;
  }

  async updateAnimal(body: UpdateAnimalApi, id: string): Promise<Animal> {
    try {
      const animal = await this.animalRepository.findOneBy({ id });
      const encrypBody = encryptObject(body);
      const animalUpdated = await this.animalRepository.save({
        ...animal,
        ...encrypBody,
        updatedAt: new Date(),
      });
      return animalUpdated;
    } catch (error) {
      throw new BadRequestException(errorMessage.api('animal').NOT_UPDATED);
    }
  }

  async updateAnimalsStatus(
    sens: 'upgrade' | 'downgrade',
    animals: Animal[],
  ): Promise<Animal[]> {
    try {
      const animalsUpdated = await Promise.all(
        animals.map(async (animal) => {
          const animalUpdated = await this.animalRepository.save({
            ...animal,
            status: resolverAnimalStatus(sens, animal.status),
            updatedAt: new Date(),
          });
          return animalUpdated;
        }),
      );
      return animalsUpdated;
    } catch (error) {
      throw new BadRequestException(errorMessage.api('animal').NOT_UPDATED);
    }
  }

  async deleteAnimal(id: string): Promise<void> {
    try {
      await this.animalRepository.delete({ id });
    } catch (error) {
      throw new BadRequestException(errorMessage.api('animal').NOT_DELETED);
    }
  }
}
