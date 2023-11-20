import { AnimalTypeEnum } from '../dto';

export interface CreateAffiliateApi {
  url: string;
  animals: AnimalTypeEnum[];
  title: string;
  description?: string;
  image?: string;
  brand: string;
  basePrice: number;
  discountPrice: number;
}

export interface UpdateAffiliateApi {
  url?: string;
  animals?: AnimalTypeEnum[];
  title?: string;
  description?: string;
  image?: string;
  brand?: string;
  basePrice?: number;
  discountPrice?: number;
}
