import {
  Controller,
  Body,
  Get,
  Delete,
  UseGuards,
  HttpCode,
  Patch,
} from '@nestjs/common';
import { UserService } from './user.service';
import { ApiKeyGuard } from 'src/decorators/api-key.decorator';
import { ApiBearerAuth } from '@nestjs/swagger';
import { User } from './user.entity';
import { GetCurrentUser } from 'src/decorators/get-current-user.decorator';
import { UpdateUserApi, UserDto } from '@/types';

@Controller('users')
export class UserController {
  constructor(private service: UserService) {}

  @Get('me')
  @HttpCode(200)
  @UseGuards(ApiKeyGuard)
  @ApiBearerAuth()
  me(@GetCurrentUser() user: User): UserDto {
    return this.service.formatUser(user);
  }

  @Patch('me')
  @HttpCode(200)
  @UseGuards(ApiKeyGuard)
  @ApiBearerAuth()
  async update(
    @Body() body: UpdateUserApi,
    @GetCurrentUser() user: User,
  ): Promise<UserDto> {
    const userUpdated = await this.service.updateUser(body, user.id);
    return this.service.formatUser(userUpdated);
  }

  @Delete('me')
  @HttpCode(204)
  @UseGuards(ApiKeyGuard)
  @ApiBearerAuth()
  deleteUser(@GetCurrentUser() user: User): void {
    this.service.deleteUser(user.id);
  }
}
