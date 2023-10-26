import { CreateAddressApi } from './Address';

export interface AuthRegisterApi {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  address?: CreateAddressApi;
}

export interface AuthLoginApi {
  email: string;
  password: string;
}
