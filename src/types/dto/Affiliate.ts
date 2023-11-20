import { AnimalTypeEnum } from './Animal';
import { BaseDto } from './BaseDto';
import { MediaDto } from './Media';

export interface AffiliateDto extends BaseDto {
  url: string;
  animals: AnimalTypeEnum[];
  title: string;
  description?: string;
  image?: MediaDto;
  brand: string;
  basePrice: number;
  discountPrice: number;
}
