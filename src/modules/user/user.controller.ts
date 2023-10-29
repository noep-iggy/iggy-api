import {
  Controller,
  Body,
  Get,
  Delete,
  UseGuards,
  HttpCode,
  Patch,
  BadRequestException,
} from '@nestjs/common';
import { UserService } from './user.service';
import { ApiKeyGuard } from 'src/decorators/api-key.decorator';
import { ApiBearerAuth } from '@nestjs/swagger';
import { User } from './user.entity';
import { GetCurrentUser } from 'src/decorators/get-current-user.decorator';
import { TaskDto, UpdateUserApi, UserDto } from '@/types';
import { userValidation } from '@/validations';
import { TaskService } from '../task/task.service';

@Controller('user')
export class UserController {
  constructor(
    private service: UserService,
    private taskService: TaskService,
  ) {}

  @Get()
  @HttpCode(200)
  @UseGuards(ApiKeyGuard)
  @ApiBearerAuth()
  async me(@GetCurrentUser() user: User): Promise<UserDto> {
    const tasks = await this.taskService.findTaskByUserId(user.id);
    return this.service.formatUser({ ...user, tasks });
  }

  @Get('tasks')
  @HttpCode(200)
  @UseGuards(ApiKeyGuard)
  @ApiBearerAuth()
  async getTasks(@GetCurrentUser() user: User): Promise<TaskDto[]> {
    const tasks = await this.taskService.findTaskByUserId(user.id);
    return tasks.map((task) => this.taskService.formatTask(task));
  }

  @Patch()
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
      const userUpdated = await this.service.updateUser(body, user.id);
      return this.service.formatUser(userUpdated);
    } catch (e) {
      throw new BadRequestException(e.errors);
    }
  }

  @Delete()
  @HttpCode(204)
  @UseGuards(ApiKeyGuard)
  @ApiBearerAuth()
  deleteUser(@GetCurrentUser() user: User): void {
    this.service.deleteUser(user.id);
  }
}
