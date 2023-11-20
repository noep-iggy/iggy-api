import { AnimalTypeEnum, CreateAffiliateApi } from '@/types';

export const affiliates: CreateAffiliateApi[] = [
  {
    title: 'Amazon',
    description: 'Amazon affiliate',
    url: 'https://www.amazon.fr',
    animals: [AnimalTypeEnum.CAT],
    brand: 'Amazon',
    basePrice: 50,
    discountPrice: 40,
  },
  {
    title: 'Ebay',
    description: 'Ebay affiliate',
    url: 'https://www.ebay.fr',
    animals: [AnimalTypeEnum.DOG, AnimalTypeEnum.CAT],
    brand: 'Ebay',
    basePrice: 50,
    discountPrice: 40,
  },
];
