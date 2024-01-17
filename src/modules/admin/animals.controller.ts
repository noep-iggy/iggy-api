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
import { SearchParams, UpdateHouseApi } from '@/types';
import { animalValidation } from '@/validations';
import { AnimalService } from '../animal/animal.service';
import { GetSearchParams } from '@/decorators/get-search-params.decorator';
import { TaskService } from '../task/task.service';

@Controller('admin')
export class AdminAnimalsController {
  constructor(
    @Inject(forwardRef(() => AnimalService))
    private animalService: AnimalService,
    @Inject(forwardRef(() => TaskService))
    private readonly taskService: TaskService,
  ) {}

  @Get('animals')
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
        (await this.animalService.getAnimals(searchParams)).map(
          async (animal) => {
            const tasks = await this.taskService.findTasksByAnimalId(animal.id);
            return this.animalService.formatAnimal({ ...animal, tasks });
          },
        ),
      );
    } catch (e) {
      console.log(e);
      throw new BadRequestException(e);
    }
  }

  @Get('animals/:id')
  @HttpCode(200)
  @UseGuards(ApiKeyGuard)
  @ApiBearerAuth()
  async getUser(@GetCurrentUser() user: User, @Param('id') id: string) {
    try {
      if (!user.isAdmin)
        throw new BadRequestException(errorMessage.api('admin').NOT_ADMIN);
      return this.animalService.formatAnimal(
        await this.animalService.findOneById(id),
      );
    } catch (e) {
      console.log(e);
      throw new BadRequestException(e);
    }
  }

  @Patch('animals/:id')
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
      await animalValidation.update.validate(body, {
        abortEarly: false,
      });
      return this.animalService.formatAnimal(
        await this.animalService.updateAnimal(body, id),
      );
    } catch (e) {
      console.log(e);
      throw new BadRequestException(e);
    }
  }

  @Delete('animals/:id')
  @HttpCode(204)
  @UseGuards(ApiKeyGuard)
  @ApiBearerAuth()
  async deleteUser(@GetCurrentUser() user: User, @Param('id') id: string) {
    try {
      if (!user.isAdmin)
        throw new BadRequestException(errorMessage.api('admin').NOT_ADMIN);
      await this.animalService.deleteAnimal(id);
    } catch (e) {
      console.log(e);
      throw new BadRequestException(e);
    }
  }
}
