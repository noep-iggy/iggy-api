import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  HttpCode,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AnimalService } from './animal.service';
import { ApiKeyGuard } from '@/decorators/api-key.decorator';
import { GetCurrentUser } from '@/decorators/get-current-user.decorator';
import { CreateAnimalApi } from '@/types';
import { animalValidation } from '@/validations';
import { ApiBearerAuth } from '@nestjs/swagger';
import { User } from '../user/user.entity';

@Controller('animals')
export class AnimalController {
  constructor(private readonly service: AnimalService) {}

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

  @Patch(':id')
  @HttpCode(200)
  @UseGuards(ApiKeyGuard)
  @ApiBearerAuth()
  async updateAnimal(
    @Body() body: CreateAnimalApi,
    @Param() params: { id: string },
  ) {
    try {
      await animalValidation.update.validate(body, {
        abortEarly: false,
      });
      const animal = await this.service.updateAnimal(body, params.id);
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
