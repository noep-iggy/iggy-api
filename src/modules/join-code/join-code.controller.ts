import {
  BadRequestException,
  Controller,
  Get,
  HttpCode,
  Param,
  UseGuards,
} from '@nestjs/common';
import { JoinCodeService } from './join-code.service';
import { ApiKeyGuard } from '@/decorators/api-key.decorator';
import { GetCurrentUser } from '@/decorators/get-current-user.decorator';
import { ApiBearerAuth } from '@nestjs/swagger';
import { User } from '../user/user.entity';
import { JoinCodeTypeEnum } from '@/types';
import { errorMessage } from '@/errors';

@Controller('join-code')
export class JoincodeController {
  constructor(private readonly service: JoinCodeService) {}

  @Get('create/parent')
  @HttpCode(200)
  @UseGuards(ApiKeyGuard)
  @ApiBearerAuth()
  async createJoincodeParent(@GetCurrentUser() user: User) {
    if (!user.house)
      throw new BadRequestException(errorMessage.api('house').NOT_FOUND);
    const joincode = await this.service.createJoincode(
      user.house,
      JoinCodeTypeEnum.PARENT,
    );
    return this.service.formatJoinCode(joincode);
  }

  @Get('create/child')
  @HttpCode(200)
  @UseGuards(ApiKeyGuard)
  @ApiBearerAuth()
  async createJoincodeChild(@GetCurrentUser() user: User) {
    if (!user.house)
      throw new BadRequestException(errorMessage.api('house').NOT_FOUND);
    const joincode = await this.service.createJoincode(
      user.house,
      JoinCodeTypeEnum.CHILD,
    );
    return this.service.formatJoinCode(joincode);
  }

  @Get(':code')
  @HttpCode(200)
  @UseGuards(ApiKeyGuard)
  async getJoincode(@Param('code') code: string) {
    const joincode = await this.service.findJoincodeByCode(code);
    return this.service.formatJoinCode(joincode);
  }
}
