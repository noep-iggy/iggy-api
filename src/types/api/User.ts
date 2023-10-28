import { UserRoleEnum } from '../dto';

export interface UpdateUserApi {
  email?: string;
  userName?: string;
  profilePicture?: string;
  role?: UserRoleEnum;
}
