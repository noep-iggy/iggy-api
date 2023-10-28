import { UserRoleEnum } from '../dto';

export interface AuthRegisterApi {
  email: string;
  password: string;
  userName: string;
  role: UserRoleEnum;
}

export interface AuthLoginApi {
  email: string;
  password: string;
}
