import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { TaskService } from './task.service';
import { ApiKeyGuard } from '@/decorators/api-key.decorator';
import {
  CheckTaskApi,
  CreateTaskApi,
  RefuseTaskAPi,
  TaskStatusEnum,
  UpdateTaskApi,
} from '@/types';
import { taskValidation } from '@/validations';
import { ApiBearerAuth } from '@nestjs/swagger';
import { errorMessage } from '@/errors';
import { GetCurrentUser } from '@/decorators/get-current-user.decorator';
import { User } from '../user/user.entity';

@Controller('tasks')
export class TaskController {
  constructor(private readonly service: TaskService) {}

  @Get()
  @HttpCode(200)
  @UseGuards(ApiKeyGuard)
  @ApiBearerAuth()
  async getTasks(@GetCurrentUser() user: User) {
    if (!user.house)
      throw new BadRequestException(errorMessage.api('house').NOT_FOUND);
    const tasks = await this.service.findTaskByHouseId(user.house.id);
    return tasks.map((task) => this.service.formatTask(task));
  }

  @Get('status/:status')
  @HttpCode(200)
  @UseGuards(ApiKeyGuard)
  @ApiBearerAuth()
  async getArchiveTasks(
    @GetCurrentUser() user: User,
    @Param('status') status: TaskStatusEnum,
  ) {
    if (!user.house)
      throw new BadRequestException(errorMessage.api('house').NOT_FOUND);
    if (TaskStatusEnum[status] === undefined)
      throw new BadRequestException(errorMessage.api('task').NOT_FOUND);
    const tasks = await this.service.findTaskByStatus(user.house.id, status);
    return tasks.map((task) => this.service.formatTask(task));
  }

  @Post()
  @HttpCode(201)
  @UseGuards(ApiKeyGuard)
  @ApiBearerAuth()
  async createAnimal(@Body() body: CreateTaskApi) {
    try {
      await taskValidation.create.validate(body, {
        abortEarly: false,
      });
      const task = await this.service.createTask(body);
      return this.service.formatTask(task);
    } catch (e) {
      throw new BadRequestException(e);
    }
  }

  @Get(':id')
  @HttpCode(200)
  @UseGuards(ApiKeyGuard)
  @ApiBearerAuth()
  async getTask(@Param('id') id: string) {
    const task = await this.service.getTaskById(id);
    return this.service.formatTask(task);
  }

  @Patch(':id')
  @HttpCode(200)
  @UseGuards(ApiKeyGuard)
  @ApiBearerAuth()
  async updateTask(@Param('id') id: string, @Body() body: UpdateTaskApi) {
    try {
      await taskValidation.update.validate(body, {
        abortEarly: false,
      });
      const taskUpdated = await this.service.updateTask(body, id);
      return this.service.formatTask(taskUpdated);
    } catch (e) {
      throw new BadRequestException(e);
    }
  }

  @Patch(':id/check')
  @HttpCode(200)
  @UseGuards(ApiKeyGuard)
  @ApiBearerAuth()
  async checkTask(@Param('id') id: string, @Body() body: CheckTaskApi) {
    const taskUpdated = await this.service.checkTask(id, body.pictureId);
    return this.service.formatTask(taskUpdated);
  }

  @Get(':id/validate')
  @HttpCode(200)
  @UseGuards(ApiKeyGuard)
  @ApiBearerAuth()
  async validateTask(@Param('id') id: string) {
    const taskUpdated = await this.service.validateTask(id);
    return this.service.formatTask(taskUpdated);
  }

  @Patch(':id/refuse')
  @HttpCode(200)
  @UseGuards(ApiKeyGuard)
  @ApiBearerAuth()
  async refuseTask(@Param('id') id: string, @Body() body: RefuseTaskAPi) {
    try {
      const taskUpdated = await this.service.refuseTask(id, body.message);
      return this.service.formatTask(taskUpdated);
    } catch (e) {
      throw new BadRequestException(e);
    }
  }

  @Delete(':id')
  @HttpCode(200)
  @UseGuards(ApiKeyGuard)
  @ApiBearerAuth()
  async deleteTask(@Param('id') id: string) {
    await this.service.deleteTask(id);
  }
}
