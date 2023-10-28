import { Controller, Get, HttpCode, UseGuards } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JoinCodeService } from './join-code.service';
import { ApiKeyGuard } from '@/decorators/api-key.decorator';
import { GetCurrentUser } from '@/decorators/get-current-user.decorator';
import { ApiBearerAuth } from '@nestjs/swagger';
import { User } from '../user/user.entity';

@Controller('join-codes')
export class JoincodeController {
  constructor(
    private readonly service: JoinCodeService,
    private readonly userService: UserService,
  ) {}

  @Get('create')
  @HttpCode(200)
  @UseGuards(ApiKeyGuard)
  @ApiBearerAuth()
  async createJoincode(@GetCurrentUser() user: User) {
    const joincode = await this.service.createJoincode(user.house);
    return this.service.formatJoinCode(joincode);
  }

  @Get('delete')
  @HttpCode(200)
  @UseGuards(ApiKeyGuard)
  @ApiBearerAuth()
  async deleteJoincode(@GetCurrentUser() user: User) {
    await this.service.deleteJoincodesByHouseId(user.house.id);
    return { message: 'ok' };
  }
}
