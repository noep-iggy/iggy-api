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
import { houseValidation } from '@/validations';
import { HouseService } from '../house/house.service';
import { GetSearchParams } from '@/decorators/get-search-params.decorator';

@Controller('admin')
export class AdminHousesController {
  constructor(
    @Inject(forwardRef(() => HouseService))
    private houseService: HouseService,
  ) {}

  @Get('houses')
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
        (await this.houseService.getHouses(searchParams)).map((user) =>
          this.houseService.formatHouse(user),
        ),
      );
    } catch (e) {
      console.log(e);
      throw new BadRequestException(e);
    }
  }

  @Get('houses/:id')
  @HttpCode(200)
  @UseGuards(ApiKeyGuard)
  @ApiBearerAuth()
  async getUser(@GetCurrentUser() user: User, @Param('id') id: string) {
    try {
      if (!user.isAdmin)
        throw new BadRequestException(errorMessage.api('admin').NOT_ADMIN);
      return this.houseService.formatHouse(
        await this.houseService.getHouse(id),
      );
    } catch (e) {
      console.log(e);
      throw new BadRequestException(e);
    }
  }

  @Patch('houses/:id')
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
      return this.houseService.formatHouse(
        await this.houseService.updateHouse(body, id),
      );
    } catch (e) {
      console.log(e);
      throw new BadRequestException(e);
    }
  }

  @Delete('houses/:id')
  @HttpCode(204)
  @UseGuards(ApiKeyGuard)
  @ApiBearerAuth()
  async deleteUser(@GetCurrentUser() user: User, @Param('id') id: string) {
    try {
      if (!user.isAdmin)
        throw new BadRequestException(errorMessage.api('admin').NOT_ADMIN);
      await this.houseService.deleteHouse(id);
    } catch (e) {
      console.log(e);
      throw new BadRequestException(e);
    }
  }
}
