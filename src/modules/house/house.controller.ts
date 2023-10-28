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

@Controller('houses')
export class HouseController {
  constructor(
    private readonly service: HouseService,
    private readonly userService: UserService,
    private readonly joincodeService: JoinCodeService,
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
      const house = await this.service.createHouse(body, user);
      return this.service.formatHouse(house);
    } catch (e) {
      throw new BadRequestException(e.errors);
    }
  }

  @Get('me')
  @HttpCode(200)
  @UseGuards(ApiKeyGuard)
  @ApiBearerAuth()
  async getHouse(@GetCurrentUser() user: User) {
    const house = await this.service.getHouse(user.house.id);
    const users = await this.userService.findUsersByHouseId(house.id);
    return this.service.formatHouse({ ...house, users });
  }

  @Patch('me')
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

  @Get('me/users')
  @HttpCode(200)
  @UseGuards(ApiKeyGuard)
  @ApiBearerAuth()
  async getUsers(@GetCurrentUser() user: User) {
    const users = await this.userService.findUsersByHouseId(user.house.id);
    return users.map((user) => this.userService.formatUser(user));
  }

  @Get('me/join-codes')
  @HttpCode(200)
  @UseGuards(ApiKeyGuard)
  @ApiBearerAuth()
  async getJoinCodes(@GetCurrentUser() user: User) {
    return this.joincodeService.formatJoinCode(user.house.joinCodes);
  }
}
