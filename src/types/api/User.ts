import { UserRoleEnum } from '../dto';
import { UpdateHouseApi } from './House';

export interface UpdateUserApi {
  email?: string;
  userName?: string;
  profilePicture?: string;
  role?: UserRoleEnum;
  house?: UpdateHouseApi;
}
