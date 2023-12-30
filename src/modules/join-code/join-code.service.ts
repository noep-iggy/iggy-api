import { Repository } from 'typeorm';
import { JoinCodeDto, JoinCodeTypeEnum } from '@/types';
import { House } from '../house/house.entity';
import { errorMessage } from '@/errors';
import { Injectable } from '@nestjs/common';
import { JoinCode } from './join-code.entity';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';

// 15 minutes
const TIMEOUT_JOINCODE = 1000 * 60 * 15;

@Injectable()
export class JoinCodeService {
  constructor(
    @InjectRepository(JoinCode)
    private joincodeRepository: Repository<JoinCode>,
  ) {}

  formatJoinCode(joinCode?: JoinCode): JoinCodeDto {
    if (!joinCode) return;
    return {
      code: joinCode.code,
      expirationDate: joinCode.expirationDate,
      type: joinCode.type,
      house: joinCode.house.id,
    };
  }

  async createJoincode(
    house: House,
    type: JoinCodeTypeEnum,
  ): Promise<JoinCode> {
    const joinCode = await this.findJoincodeByHouseId(house.id);
    if (joinCode) await this.deleteJoinCode(joinCode.id);
    const joinCodeData = {
      code: this.genererCode(),
      expirationDate: new Date(Date.now() + TIMEOUT_JOINCODE),
      type: type,
      house: house,
    };
    return await this.joincodeRepository.save(joinCodeData);
  }

  async deleteJoinCode(id: string): Promise<void> {
    try {
      await this.joincodeRepository.delete(id);
    } catch (e) {
      throw new Error(errorMessage.api('joincode').NOT_DELETED);
    }
  }

  async findJoincodeByCode(code: string): Promise<JoinCode> {
    try {
      return await this.joincodeRepository.findOne({
        where: {
          code: code,
        },
        relations: ['house'],
      });
    } catch (e) {
      throw new Error(errorMessage.api('joincode').NOT_FOUND);
    }
  }

  async findJoincodeByHouseId(houseId: string): Promise<JoinCode> {
    try {
      return await this.joincodeRepository.findOne({
        where: {
          house: {
            id: houseId,
          },
        },
      });
    } catch (e) {
      console.log(e);
      throw new Error(errorMessage.api('joincode').NOT_FOUND);
    }
  }

  @Cron(CronExpression.EVERY_30_SECONDS)
  async checkJoinCodeCron(): Promise<void> {
    const joincodes = await this.joincodeRepository.find();
    Promise.all(
      joincodes.map(async (joincode) => {
        if (new Date(joincode.expirationDate) < new Date(Date.now())) {
          await this.deleteJoinCode(joincode.id);
        }
      }),
    );
  }

  async getJoincode(code: string): Promise<JoinCode> {
    try {
      return await this.joincodeRepository.findOne({
        where: {
          code: code,
        },
      });
    } catch (e) {
      throw new Error(errorMessage.api('joincode').NOT_FOUND);
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
