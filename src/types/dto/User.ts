import { BaseDto } from './BaseDto';
import { HouseDto } from './House';
import { MediaDto } from './Media';

export enum UserRoleEnum {
  PARENT = 'PARENT',
  CHILD = 'CHILD',
  ADMIN = 'ADMIN',
}

export interface UserDto extends BaseDto {
  userName: string;
  email: string;
  role: UserRoleEnum;
  profilePicture?: MediaDto;
  house?: HouseDto;
}
