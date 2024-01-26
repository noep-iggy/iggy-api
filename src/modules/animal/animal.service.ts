import { HouseService } from './../house/house.service';
import {
  BadRequestException,
  Inject,
  Injectable,
  forwardRef,
} from '@nestjs/common';
import { FindManyOptions, Raw, Repository } from 'typeorm';
import { Animal } from './animal.entity';
import {
  AnimalDto,
  AnimalStatusEnum,
  CreateAnimalApi,
  SearchParams,
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
    @Inject(forwardRef(() => HouseService))
    private readonly houseService: HouseService,
  ) {}

  formatAnimal(animalCrypted: Animal): AnimalDto {
    if (!animalCrypted) return;
    const animal = decryptObject(animalCrypted);
    return {
      ...animal,
      house: this.houseService.formatHouse(animal.house),
      tasks: animal.tasks ? animal.tasks.map((task) => task.id) : undefined,
    };
  }

  async getAnimals(searchParams: SearchParams): Promise<Animal[]> {
    try {
      const order = {
        [searchParams.orderBy ?? 'createdAt']: searchParams.orderType ?? 'DESC',
      };
      const conditions: FindManyOptions<Animal> = {
        where: {
          name: Raw(
            (alias) =>
              `LOWER(${alias}) Like '%${searchParams.search?.toLowerCase()}%'`,
          ),
        },
        relations: ['house'],
        order: {
          ...order,
          house: {
            name: searchParams.orderType ?? 'DESC',
          },
        },
        skip: searchParams.page * searchParams.pageSize,
        take: searchParams.pageSize,
      };
      return await this.animalRepository.find(conditions);
    } catch (error) {
      throw new BadRequestException(errorMessage.api('animal').NOT_FOUND);
    }
  }

  async createAnimal(body: CreateAnimalApi, user: User): Promise<Animal> {
    try {
      const { bornDate, name, ...animal } = body;
      const encryptAnimal = encryptObject({
        ...animal,
      });
      const animalUpdated = await this.animalRepository.save({
        ...encryptAnimal,
        name: name,
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
      relations: ['house'],
    });
    return animal;
  }

  async updateAnimal(body: UpdateAnimalApi, id: string): Promise<Animal> {
    try {
      const { bornDate, name, status, ...animal } = body;
      const animalToUpdate = await this.animalRepository.findOneBy({ id });
      const encrypBody = encryptObject(animal);
      await this.animalRepository.save({
        ...animalToUpdate,
        ...encrypBody,
        name: name,
        bornDate: new Date(bornDate),
        status: status,
        updatedAt: new Date(),
      });
      return await this.animalRepository.findOneBy({ id });
    } catch (error) {
      console.log(error);
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
      console.log(error);
      throw new BadRequestException(errorMessage.api('animal').NOT_DELETED);
    }
  }
}
