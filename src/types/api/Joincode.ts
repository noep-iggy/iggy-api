import { House } from '@/modules/house/house.entity';
import { JoincodeTypeEnum } from '../dto';

export interface CreateJoincodeApi {
  code: string;
  type: JoincodeTypeEnum;
  house: House;
}

export interface UpdateJoincodeApi {}
