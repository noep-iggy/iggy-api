import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { TaskService } from './task.service';
import { ApiKeyGuard } from '@/decorators/api-key.decorator';
import { CreateTaskApi } from '@/types';
import { taskValidation } from '@/validations';
import { ApiBearerAuth } from '@nestjs/swagger';

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
}
