import {
  Controller,
  Body,
  Get,
  Delete,
  UseGuards,
  HttpCode,
  Patch,
  BadRequestException,
  Param,
} from '@nestjs/common';
import { UserService } from './user.service';
import { ApiKeyGuard } from 'src/decorators/api-key.decorator';
import { ApiBearerAuth } from '@nestjs/swagger';
import { User } from './user.entity';
import { GetCurrentUser } from 'src/decorators/get-current-user.decorator';
import { TaskDto, UpdateUserApi, UserDto, UserRoleEnum } from '@/types';
import { userValidation } from '@/validations';
import { TaskService } from '../task/task.service';
import { errorMessage } from '@/errors';

@Controller('users')
export class UserController {
  constructor(
    private service: UserService,
    private taskService: TaskService,
  ) {}

  @Get('me')
  @HttpCode(200)
  @UseGuards(ApiKeyGuard)
  @ApiBearerAuth()
  async me(@GetCurrentUser() user: User): Promise<UserDto> {
    const tasks = await this.taskService.findTaskByUserId(user.id);
    return this.service.formatUser({ ...user, tasks });
  }

  @Get('me/tasks')
  @HttpCode(200)
  @UseGuards(ApiKeyGuard)
  @ApiBearerAuth()
  async getTasks(@GetCurrentUser() user: User): Promise<TaskDto[]> {
    const tasks = await this.taskService.findTaskByUserId(user.id);
    return tasks.map((task) => this.taskService.formatTask(task));
  }

  @Patch('me')
  @HttpCode(200)
  @UseGuards(ApiKeyGuard)
  @ApiBearerAuth()
  async update(
    @Body() body: UpdateUserApi,
    @GetCurrentUser() user: User,
  ): Promise<UserDto> {
    try {
      await userValidation.update.validate(body, {
        abortEarly: false,
      });
      const userUpdated = await this.service.updateUser(
        body,
        user.id,
        user.house.id,
      );
      return this.service.formatUser(userUpdated);
    } catch (e) {
      throw new BadRequestException(e.errors);
    }
  }

  @Delete('me')
  @HttpCode(204)
  @UseGuards(ApiKeyGuard)
  @ApiBearerAuth()
  deleteUser(@GetCurrentUser() user: User): void {
    this.service.deleteUser(user.id);
  }

  @Delete(':id')
  @HttpCode(204)
  @UseGuards(ApiKeyGuard)
  @ApiBearerAuth()
  deleteUserById(@GetCurrentUser() user: User, @Param('id') id: string): void {
    try {
      if (user.role !== UserRoleEnum.PARENT)
        throw new BadRequestException(errorMessage.api('user').NOT_ADMIN);
      this.service.deleteUser(id);
    } catch (e) {
      throw new BadRequestException(e.errors);
    }
  }

  @Patch(':id')
  @HttpCode(200)
  @UseGuards(ApiKeyGuard)
  @ApiBearerAuth()
  async updateUserById(
    @GetCurrentUser() user: User,
    @Param('id') id: string,
    @Body() body: UpdateUserApi,
  ): Promise<UserDto> {
    try {
      if (user.role !== UserRoleEnum.PARENT)
        throw new BadRequestException(errorMessage.api('user').NOT_ADMIN);
      await userValidation.update.validate(body, {
        abortEarly: false,
      });
      const userUpdated = await this.service.updateUser(
        body,
        id,
        user.house.id,
      );
      return this.service.formatUser(userUpdated);
    } catch (e) {
      throw new BadRequestException(e.errors);
    }
  }
}
