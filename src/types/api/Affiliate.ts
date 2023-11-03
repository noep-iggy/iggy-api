import { AnimalTypeEnum } from '../dto';

export interface CreateAffiliateApi {
  url: string;
  animals: AnimalTypeEnum[];
  title: string;
  code: string;
  description?: string;
}

export interface UpdateAffiliateApi {
  url?: string;
  animals?: AnimalTypeEnum[];
  title?: string;
  code?: string;
  description?: string;
}
