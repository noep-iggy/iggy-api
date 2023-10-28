import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiKeyGuard } from '../../decorators/api-key.decorator';
import { AuthService } from './auth.service';
import { AuthJoinApi, AuthLoginApi, AuthRegisterApi } from '@/types';
import { userValidation } from '@/validations';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

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
  async register(@Body() body: AuthRegisterApi) {
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

  @Post('join')
  @UseGuards(ApiKeyGuard)
  @HttpCode(200)
  async join(@Body() body: AuthJoinApi) {
    const { access_token } = await this.authService.join(body);
    return access_token;
  }
}
