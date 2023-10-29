import { AnimalGenderEnum, AnimalTypeEnum, AnimalStatusEnum } from '../dto';

export interface CreateAnimalApi {
  name: string;
  bornDate: Date;
  gender: AnimalGenderEnum;
  type: AnimalTypeEnum;
  status: AnimalStatusEnum;
}

export interface UpdateAnimalApi {
  name?: string;
  bornDate?: Date;
  gender?: AnimalGenderEnum;
  type?: AnimalTypeEnum;
  status?: AnimalStatusEnum;
}
