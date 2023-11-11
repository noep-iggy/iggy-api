import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { ApiKeyGuard } from 'src/decorators/api-key.decorator';
import { ApiBearerAuth } from '@nestjs/swagger';
import { GetCurrentUser } from 'src/decorators/get-current-user.decorator';
import { User } from '../user/user.entity';
import { errorMessage } from '@/errors';
import { UpdateHouseApi } from '@/types';
import { houseValidation } from '@/validations';
import { TaskService } from '../task/task.service';

@Controller('admin')
export class AdminTasksController {
  constructor(private taskService: TaskService) {}

  @Get('houses/:houseId/tasks')
  @HttpCode(200)
  @UseGuards(ApiKeyGuard)
  @ApiBearerAuth()
  async getUsers(
    @GetCurrentUser() user: User,
    @Param('houseId') houseId: string,
  ) {
    try {
      if (!user.isAdmin)
        throw new BadRequestException(errorMessage.api('admin').NOT_ADMIN);
      const tasks = await this.taskService.findTaskByHouseId(houseId);
      return Promise.all(
        tasks.map((task) => this.taskService.formatTask(task)),
      );
    } catch (e) {
      console.log(e);
      throw new BadRequestException(e);
    }
  }

  @Get('tasks/:id')
  @HttpCode(200)
  @UseGuards(ApiKeyGuard)
  @ApiBearerAuth()
  async getUser(@GetCurrentUser() user: User, @Param('id') id: string) {
    try {
      if (!user.isAdmin)
        throw new BadRequestException(errorMessage.api('admin').NOT_ADMIN);
      return this.taskService.formatTask(
        await this.taskService.getTaskById(id),
      );
    } catch (e) {
      console.log(e);
      throw new BadRequestException(e);
    }
  }

  @Patch('tasks/:id')
  @HttpCode(200)
  @UseGuards(ApiKeyGuard)
  @ApiBearerAuth()
  async updateUser(
    @GetCurrentUser() user: User,
    @Param('id') id: string,
    @Body() body: UpdateHouseApi,
  ) {
    try {
      if (!user.isAdmin)
        throw new BadRequestException(errorMessage.api('admin').NOT_ADMIN);
      await houseValidation.update.validate(body, {
        abortEarly: false,
      });
      return this.taskService.formatTask(
        await this.taskService.updateTask(body, id),
      );
    } catch (e) {
      console.log(e);
      throw new BadRequestException(e);
    }
  }

  @Delete('tasks/:id')
  @HttpCode(204)
  @UseGuards(ApiKeyGuard)
  @ApiBearerAuth()
  async deleteUser(@GetCurrentUser() user: User, @Param('id') id: string) {
    try {
      if (!user.isAdmin)
        throw new BadRequestException(errorMessage.api('admin').NOT_ADMIN);
      await this.taskService.deleteTask(id);
    } catch (e) {
      console.log(e);
      throw new BadRequestException(e);
    }
  }
}
