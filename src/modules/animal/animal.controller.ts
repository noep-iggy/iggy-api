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
  Post,
  UseGuards,
  forwardRef,
} from '@nestjs/common';
import { AnimalService } from './animal.service';
import { ApiKeyGuard } from '@/decorators/api-key.decorator';
import { GetCurrentUser } from '@/decorators/get-current-user.decorator';
import { CreateAnimalApi } from '@/types';
import { animalValidation } from '@/validations';
import { ApiBearerAuth } from '@nestjs/swagger';
import { User } from '../user/user.entity';
import { TaskService } from '../task/task.service';

@Controller('animals')
export class AnimalController {
  constructor(
    @Inject(forwardRef(() => AnimalService))
    private readonly service: AnimalService,
    @Inject(forwardRef(() => TaskService))
    private readonly taskService: TaskService,
  ) {}

  @Post()
  @HttpCode(201)
  @UseGuards(ApiKeyGuard)
  @ApiBearerAuth()
  async createAnimal(
    @Body() body: CreateAnimalApi,
    @GetCurrentUser() user: User,
  ) {
    try {
      await animalValidation.create.validate(body, {
        abortEarly: false,
      });
      const animal = await this.service.createAnimal(body, user);
      return this.service.formatAnimal(animal);
    } catch (e) {
      throw new BadRequestException(e);
    }
  }

  @Get()
  @HttpCode(200)
  @UseGuards(ApiKeyGuard)
  @ApiBearerAuth()
  async getAnimals(@GetCurrentUser() user: User) {
    try {
      const animals = await this.service.findAnimalsByHouseId(user.house.id);
      return Promise.all(
        animals.map(async (animal) => {
          const tasks = await this.taskService.findTasksByAnimalId(animal.id);
          return this.service.formatAnimal({ ...animal, tasks });
        }),
      );
    } catch (e) {
      throw new BadRequestException(e);
    }
  }

  @Get(':id')
  @HttpCode(200)
  @UseGuards(ApiKeyGuard)
  @ApiBearerAuth()
  async getAnimal(@Param('id') id: string) {
    try {
      const animal = await this.service.findOneById(id);
      const tasks = await this.taskService.findTasksByAnimalId(id);
      return this.service.formatAnimal({ ...animal, tasks });
    } catch (e) {
      throw new BadRequestException(e);
    }
  }

  @Patch(':id')
  @HttpCode(200)
  @UseGuards(ApiKeyGuard)
  @ApiBearerAuth()
  async updateAnimal(@Body() body: CreateAnimalApi, @Param('id') id: string) {
    try {
      await animalValidation.update.validate(body, {
        abortEarly: false,
      });
      const animal = await this.service.updateAnimal(body, id);
      return this.service.formatAnimal(animal);
    } catch (e) {
      throw new BadRequestException(e);
    }
  }

  @Delete(':id')
  @HttpCode(200)
  @UseGuards(ApiKeyGuard)
  @ApiBearerAuth()
  async deleteAnimal(@Param() params: { id: string }) {
    try {
      await this.service.deleteAnimal(params.id);
    } catch (e) {
      throw new BadRequestException(e);
    }
  }
}
