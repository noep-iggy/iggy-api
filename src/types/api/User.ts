import { UserRoleEnum } from '../dto';
import { UpdateHouseApi } from './House';

export interface UpdateUserApi {
  email?: string;
  firstName?: string;
  lastName?: string;
  profilePicture?: string;
  role?: UserRoleEnum;
  house?: UpdateHouseApi;
}
