import { Repository } from 'typeorm';
import { JoinCodeDto, JoincodeTypeEnum } from '@/types';
import { House } from '../house/house.entity';
import { errorMessage } from '@/errors';
import { Injectable } from '@nestjs/common';
import { JoinCode } from './join-code.entity';
import { InjectRepository } from '@nestjs/typeorm';

// 15 minutes
const TIMEOUT_JOINCODE = 1000 * 10 * 1;

@Injectable()
export class JoinCodeService {
  constructor(
    @InjectRepository(JoinCode)
    private joincodeRepository: Repository<JoinCode>,
  ) {}

  formatJoinCode(joinCode?: JoinCode[]): JoinCodeDto {
    if (!joinCode || joinCode.length === 0) return;
    return {
      child: joinCode.find(
        (joinCode) => joinCode.type === JoincodeTypeEnum.CHILD,
      )?.code,
      parent: joinCode.find(
        (joinCode) => joinCode.type === JoincodeTypeEnum.PARENT,
      )?.code,
    };
  }

  async createJoincode(house: House): Promise<JoinCode[]> {
    if (house.joinCodes.length > 0) return house.joinCodes;
    const codes = await Promise.all([
      this.joincodeRepository.save({
        code: this.genererCode(),
        house: house,
        type: JoincodeTypeEnum.CHILD,
      }),
      this.joincodeRepository.save({
        code: this.genererCode(),
        house: house,
        type: JoincodeTypeEnum.PARENT,
      }),
    ]);

    setTimeout(async () => {
      await this.deleteJoincodesByHouseId(house.id);
    }, TIMEOUT_JOINCODE);

    return codes;
  }

  async deleteJoincodesByHouseId(houseId: string): Promise<void> {
    try {
      await this.joincodeRepository.delete({
        house: {
          id: houseId,
        },
      });
    } catch (e) {
      console.log(e);
      throw new Error(errorMessage.api('joincode').NOT_DELETED);
    }
  }

  genererCode(): string {
    let chiffreAleatoire = '';
    for (let i = 0; i < 6; i++) {
      const chiffre = Math.floor(Math.random() * 10);
      chiffreAleatoire += chiffre.toString();
    }
    return chiffreAleatoire;
  }
}
