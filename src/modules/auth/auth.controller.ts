import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  NotFoundException,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiKeyGuard } from '../../decorators/api-key.decorator';
import { AuthService } from './auth.service';
import { AuthLoginApi, JoinApi, RegisterApi, UserRoleEnum } from '@/types';
import { userValidation } from '@/validations';
import { errorMessage } from '@/errors';
import { JoinCodeService } from '../join-code/join-code.service';
import { HouseService } from '../house/house.service';
import { JwtService } from '@nestjs/jwt';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private joinCodeService: JoinCodeService,
    private houseService: HouseService,
    private jwtService: JwtService,
  ) {}

  @Post('login')
  @UseGuards(ApiKeyGuard)
  @HttpCode(200)
  async login(@Body() body: AuthLoginApi) {
    try {
      await userValidation.login.validate(body, {
        abortEarly: false,
      });
      return await this.authService.login(body);
    } catch (e) {
      throw new BadRequestException(e);
    }
  }

  @Post('register')
  @UseGuards(ApiKeyGuard)
  @HttpCode(200)
  async register(@Body() body: RegisterApi) {
    try {
      await userValidation.create.validate(body, {
        abortEarly: false,
      });
      const { access_token } = await this.authService.register(body);
      return access_token;
    } catch (e) {
      throw new BadRequestException(e);
    }
  }

  @Post('join/:code')
  @UseGuards(ApiKeyGuard)
  @HttpCode(200)
  async join(@Body() body: JoinApi, @Param('code') code: string) {
    try {
      const joinCode = await this.joinCodeService.getJoincode(code);
      if (!joinCode)
        throw new NotFoundException(errorMessage.api('joincode').NOT_FOUND);
      const possibleUser = await this.houseService.findUserByNameInHouse(
        body.firstName,
        joinCode.house.id,
      );
      if (possibleUser) {
        const payload = {
          userName: possibleUser.firstName,
          id: possibleUser.id,
        };
        return {
          access_token: this.jwtService.sign(payload),
        };
      } else {
        if ((joinCode.type as unknown as UserRoleEnum) === UserRoleEnum.CHILD) {
          await userValidation.joinChild.validate(body, {
            abortEarly: false,
          });
          return (await this.authService.joinChild(body, joinCode.house))
            .access_token;
        } else {
          await userValidation.joinParent.validate(body, {
            abortEarly: false,
          });
          return (await this.authService.joinParent(body, joinCode.house))
            .access_token;
        }
      }
    } catch (e) {
      throw new BadRequestException(e);
    }
  }
}
