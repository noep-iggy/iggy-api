import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { HouseService } from './house.service';
import { ApiKeyGuard } from '@/decorators/api-key.decorator';
import { ApiBearerAuth } from '@nestjs/swagger';
import { GetCurrentUser } from '@/decorators/get-current-user.decorator';
import { CreateHouseApi } from '@/types';
import { User } from '../user/user.entity';
import { houseValidation } from '@/validations';
import { UserService } from '../user/user.service';
import { JoinCodeService } from '../join-code/join-code.service';
import { errorMessage } from '@/errors';
import { AnimalService } from '../animal/animal.service';
import { TaskService } from '../task/task.service';

@Controller('house')
export class HouseController {
  constructor(
    private readonly service: HouseService,
    private readonly userService: UserService,
    private readonly joincodeService: JoinCodeService,
    private readonly animalService: AnimalService,
    private readonly taskService: TaskService,
  ) {}

  @Post()
  @HttpCode(201)
  @UseGuards(ApiKeyGuard)
  @ApiBearerAuth()
  async createHouse(
    @Body() body: CreateHouseApi,
    @GetCurrentUser() user: User,
  ) {
    try {
      await houseValidation.create.validate(body, {
        abortEarly: false,
      });
      if (user.house) {
        throw new BadRequestException(
          errorMessage.api('house').ALREADY_CREATED,
        );
      }
      const house = await this.service.createHouse(body, user);
      return this.service.formatHouse(house);
    } catch (e) {
      throw new BadRequestException(e);
    }
  }

  @Get()
  @HttpCode(200)
  @UseGuards(ApiKeyGuard)
  @ApiBearerAuth()
  async getHouse(@GetCurrentUser() user: User) {
    if (!user.house)
      throw new BadRequestException(errorMessage.api('house').NOT_FOUND);
    const house = await this.service.getHouse(user.house.id);
    const users = await this.userService.findUsersByHouseId(house.id);
    const joinCode = await this.joincodeService.findJoincodeByHouseId(house.id);
    return this.service.formatHouse({ ...house, users, joinCode });
  }

  @Patch()
  @HttpCode(200)
  @UseGuards(ApiKeyGuard)
  @ApiBearerAuth()
  async updateHouse(
    @Body() body: CreateHouseApi,
    @GetCurrentUser() user: User,
  ) {
    try {
      await houseValidation.update.validate(body, {
        abortEarly: false,
      });
      const house = await this.service.updateHouse(body, user.house.id);
      return this.service.formatHouse(house);
    } catch (e) {
      throw new BadRequestException(e.errors);
    }
  }

  @Get('users')
  @HttpCode(200)
  @UseGuards(ApiKeyGuard)
  @ApiBearerAuth()
  async getUsers(@GetCurrentUser() user: User) {
    if (!user.house)
      throw new BadRequestException(errorMessage.api('house').NOT_FOUND);
    const users = await this.userService.findUsersByHouseId(user.house.id);
    return users.map((user) => this.userService.formatUser(user));
  }

  @Get('join-codes')
  @HttpCode(200)
  @UseGuards(ApiKeyGuard)
  @ApiBearerAuth()
  async getJoinCodes(@GetCurrentUser() user: User) {
    if (!user.house)
      throw new BadRequestException(errorMessage.api('house').NOT_FOUND);
    return this.joincodeService.formatJoinCode(user.house.joinCode);
  }

  @Get('animals')
  @HttpCode(200)
  @UseGuards(ApiKeyGuard)
  @ApiBearerAuth()
  async getAnimals(@GetCurrentUser() user: User) {
    if (!user.house)
      throw new BadRequestException(errorMessage.api('house').NOT_FOUND);
    return Promise.all(
      user.house.animals.map(async (animal) => {
        const tasks = await this.taskService.findTasksByAnimalId(animal.id);
        return this.animalService.formatAnimal({ ...animal, tasks });
      }),
    );
  }

  @Get('tasks')
  @HttpCode(200)
  @UseGuards(ApiKeyGuard)
  @ApiBearerAuth()
  async getTasks(@GetCurrentUser() user: User) {
    if (!user.house)
      throw new BadRequestException(errorMessage.api('house').NOT_FOUND);
    const tasks = await this.taskService.findTaskByUserId(user.id);
    return tasks.map((task) => this.taskService.formatTask(task));
  }
}
