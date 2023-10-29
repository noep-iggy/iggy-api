import { House } from '@/modules/house/house.entity';
import { JoinCodeTypeEnum } from '../dto';

export interface CreateJoincodeApi {
  code: string;
  type: JoinCodeTypeEnum;
  house: House;
}

export interface UpdateJoincodeApi {}
