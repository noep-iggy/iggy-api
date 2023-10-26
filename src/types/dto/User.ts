import { AddressDto } from './Address';
import { MediaDto } from './Media';

export interface UserDto {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  isAdmin: boolean;
  address: AddressDto;
  profilePicture?: MediaDto;
}
