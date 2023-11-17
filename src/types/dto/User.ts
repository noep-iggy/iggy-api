import { BaseDto } from './BaseDto';
import { HouseDto } from './House';
import { MediaDto } from './Media';

export enum UserRoleEnum {
  PARENT = 'PARENT',
  CHILD = 'CHILD',
}

export interface UserDto extends BaseDto {
  firstName: string;
  email?: string;
  lastName?: string;
  role: UserRoleEnum;
  profilePicture?: MediaDto;
  house?: HouseDto;
  tasks?: string[];
  isAdmin: boolean;
}
