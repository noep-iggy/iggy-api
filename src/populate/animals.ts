import { CreateAnimalApi, AnimalTypeEnum, AnimalGenderEnum } from '@/types';

export const animals: CreateAnimalApi[] = [
  {
    name: 'Chat',
    type: AnimalTypeEnum.CAT,
    gender: AnimalGenderEnum.MASCULINE,
    bornDate: new Date(),
  },
  {
    name: 'Chien',
    type: AnimalTypeEnum.DOG,
    gender: AnimalGenderEnum.FEMININE,
    bornDate: new Date(),
  },
];
