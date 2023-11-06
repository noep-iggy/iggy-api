import { CreateAffiliateApi, AnimalTypeEnum } from '@/types';

export const affiliates: CreateAffiliateApi[] = [
  {
    title: 'Amazon',
    description: 'Amazon affiliate',
    url: 'https://www.amazon.fr',
    code: 'azerty',
    animals: [AnimalTypeEnum.CAT],
  },
  {
    title: 'Ebay',
    description: 'Ebay affiliate',
    url: 'https://www.ebay.fr',
    code: 'azerty',
    animals: [AnimalTypeEnum.DOG, AnimalTypeEnum.CAT],
  },
];
