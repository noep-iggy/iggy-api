import { Controller, Get, HttpCode, UseGuards } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JoinCodeService } from './join-code.service';
import { ApiKeyGuard } from '@/decorators/api-key.decorator';
import { GetCurrentUser } from '@/decorators/get-current-user.decorator';
import { ApiBearerAuth } from '@nestjs/swagger';
import { User } from '../user/user.entity';
import { JoinCodeTypeEnum } from '@/types';

@Controller('join-codes')
export class JoincodeController {
  constructor(
    private readonly service: JoinCodeService,
    private readonly userService: UserService,
  ) {}

  @Get('create/parent')
  @HttpCode(200)
  @UseGuards(ApiKeyGuard)
  @ApiBearerAuth()
  async createJoincodeParent(@GetCurrentUser() user: User) {
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
    const joincode = await this.service.createJoincode(
      user.house,
      JoinCodeTypeEnum.CHILD,
    );
    return this.service.formatJoinCode(joincode);
  }

  @Get('me')
  @HttpCode(200)
  @UseGuards(ApiKeyGuard)
  @ApiBearerAuth()
  async getJoincode(@GetCurrentUser() user: User) {
    const joincode = await this.service.findJoincodeByHouseId(user.house.id);
    return this.service.formatJoinCode(joincode);
  }
}
