import { AnimalTypeEnum } from './Animal';
import { BaseDto } from './BaseDto';

export interface AffiliateDto extends BaseDto {
  url: string;
  animals: AnimalTypeEnum[];
  title: string;
  code: string;
  description?: string;
}
