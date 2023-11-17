import { AnimalGenderEnum, AnimalStatusEnum, AnimalTypeEnum } from '../dto';

export interface CreateAnimalApi {
  name: string;
  bornDate: Date;
  gender: AnimalGenderEnum;
  type: AnimalTypeEnum;
}

export interface UpdateAnimalApi {
  name?: string;
  bornDate?: Date;
  gender?: AnimalGenderEnum;
  type?: AnimalTypeEnum;
  status?: AnimalStatusEnum;
}
