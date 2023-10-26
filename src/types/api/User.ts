import { UpdateAddressApi } from './Address';

export interface UpdateUserApi {
  email?: string;
  firstName?: string;
  lastName?: string;
  profilePicture?: string;
  address?: UpdateAddressApi;
}
