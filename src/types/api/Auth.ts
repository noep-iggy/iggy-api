import { UserRoleEnum } from '../dto';

export interface AuthRegisterApi {
  email?: string;
  password: string;
  userName: string;
  role: UserRoleEnum;
}

export interface AuthJoinApi {
  email?: string;
  password: string;
  userName: string;
  role: UserRoleEnum;
  code: string;
}

export interface AuthLoginApi {
  userName: string;
  password: string;
}
