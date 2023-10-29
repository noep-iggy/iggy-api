import { BaseDto } from './BaseDto';
import { JoinCodeDto } from './Joincode';

export interface HouseDto extends BaseDto {
  name: string;
  users: string[];
  joinCode: JoinCodeDto;
}
