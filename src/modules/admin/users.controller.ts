import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Inject,
  Param,
  Patch,
  UseGuards,
  forwardRef,
} from '@nestjs/common';
import { ApiKeyGuard } from 'src/decorators/api-key.decorator';
import { ApiBearerAuth } from '@nestjs/swagger';
import { GetCurrentUser } from 'src/decorators/get-current-user.decorator';
import { User } from '../user/user.entity';
import { errorMessage } from '@/errors';
import { UserService } from '../user/user.service';
import { SearchParams, UpdateUserApi } from '@/types';
import { userValidation } from '@/validations';
import { GetSearchParams } from '@/decorators/get-search-params.decorator';

@Controller('admin')
export class AdminUsersController {
  constructor(
    @Inject(forwardRef(() => UserService))
    private userService: UserService,
  ) {}

  @Get('users/:id/toggle-admin-status')
  @HttpCode(200)
  @UseGuards(ApiKeyGuard)
  @ApiBearerAuth()
  async createAdmin(@GetCurrentUser() user: User, @Param('id') id: string) {
    try {
      if (!user.isAdmin)
        throw new BadRequestException(errorMessage.api('admin').NOT_ADMIN);
      if (user.id === id)
        throw new BadRequestException(
          errorMessage.api('admin').CANNOT_CHANGE_OWN_STATUS,
        );
      return this.userService.formatUser(
        await this.userService.toggleAdminStatus(id),
      );
    } catch (e) {
      console.log(e);
      throw new BadRequestException(e);
    }
  }

  @Get('users')
  @HttpCode(200)
  @UseGuards(ApiKeyGuard)
  @ApiBearerAuth()
  async getUsers(
    @GetCurrentUser() user: User,
    @GetSearchParams() searchParams: SearchParams,
  ) {
    try {
      if (!user.isAdmin)
        throw new BadRequestException(errorMessage.api('admin').NOT_ADMIN);
      return Promise.all(
        (await this.userService.getUsers(searchParams)).map((user) =>
          this.userService.formatUser(user),
        ),
      );
    } catch (e) {
      console.log(e);
      throw new BadRequestException(e);
    }
  }

  @Get('users/:id')
  @HttpCode(200)
  @UseGuards(ApiKeyGuard)
  @ApiBearerAuth()
  async getUser(@GetCurrentUser() user: User, @Param('id') id: string) {
    try {
      if (!user.isAdmin)
        throw new BadRequestException(errorMessage.api('admin').NOT_ADMIN);
      return this.userService.formatUser(await this.userService.getUser(id));
    } catch (e) {
      console.log(e);
      throw new BadRequestException(e);
    }
  }

  @Patch('users/:id')
  @HttpCode(200)
  @UseGuards(ApiKeyGuard)
  @ApiBearerAuth()
  async updateUser(
    @GetCurrentUser() user: User,
    @Param('id') id: string,
    @Body() body: UpdateUserApi,
  ) {
    try {
      if (!user.isAdmin)
        throw new BadRequestException(errorMessage.api('admin').NOT_ADMIN);
      await userValidation.update.validate(body, {
        abortEarly: false,
      });
      return this.userService.formatUser(
        await this.userService.updateUser(body, id),
      );
    } catch (e) {
      console.log(e);
      throw new BadRequestException(e);
    }
  }

  @Delete('users/:id')
  @HttpCode(204)
  @UseGuards(ApiKeyGuard)
  @ApiBearerAuth()
  async deleteUser(@GetCurrentUser() user: User, @Param('id') id: string) {
    try {
      if (!user.isAdmin)
        throw new BadRequestException(errorMessage.api('admin').NOT_ADMIN);
      await this.userService.deleteUser(id);
    } catch (e) {
      console.log(e);
      throw new BadRequestException(e);
    }
  }
}
