import { BaseDto } from './BaseDto';
import { HouseDto } from './House';

export enum AnimalGenderEnum {
  MASCULINE = 'MASCULINE',
  FEMININE = 'FEMININE',
}

export enum AnimalTypeEnum {
  DOG = 'DOG',
  CAT = 'CAT',
}

export enum AnimalStatusEnum {
  SLEEPING = 'SLEEPING',
  HAPPY = 'HAPPY',
  NORMAL = 'NORMAL',
  SAD = 'SAD',
}

export interface AnimalDto extends BaseDto {
  id: string;
  name: string;
  bornDate: Date;
  gender: AnimalGenderEnum;
  type: AnimalTypeEnum;
  status: AnimalStatusEnum;
  house: HouseDto;
  tasks?: string[];
}
