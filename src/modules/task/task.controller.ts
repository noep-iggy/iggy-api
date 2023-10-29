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

@Controller('tasks')
export class TaskController {
  constructor(private readonly service: TaskService) {}

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
      const task = await this.service.getTaskById(id);
      if (task.status === TaskStatusEnum.DONE)
        throw new BadRequestException(errorMessage.api('task').ALREADY_DONE);

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
    const task = await this.service.getTaskById(id);
    await this.service.deleteTask(task);
    return this.service.formatTask(task);
  }
}
