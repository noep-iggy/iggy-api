import { BaseDto } from './BaseDto';

export interface HouseDto extends BaseDto {
  name: string;
  users: string[];
}
