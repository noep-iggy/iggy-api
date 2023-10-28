import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt/dist/jwt.service';
import * as bcrypt from 'bcryptjs';
import { UserService } from '../user/user.service';
import { AuthValidation } from './auth.validation';
import { errorMessage } from '@/errors';
import { AuthJoinApi, AuthLoginApi, AuthRegisterApi } from '@/types';

@Injectable()
export class AuthService {
  constructor(
    private userRepository: UserService,
    private authValidation: AuthValidation,
    private jwtService: JwtService,
  ) {}

  async login(body: AuthLoginApi) {
    const user = await this.userRepository.findOneByName(body.userName);
    if (!user)
      throw new NotFoundException(
        errorMessage.api('user').NOT_FOUND_OR_WRONG_PASSWORD,
      );
    await this.authValidation.validateUser(body.userName, body.password);
    const payload = { email: user.email, id: user.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async join(body: AuthJoinApi) {
    const { userName, password } = body;
    const encryptedPassword = await this.encryptPassword(password);
    const createdUser = await this.userRepository.createUser({
      ...body,
      password: encryptedPassword,
    });
    return {
      access_token: await this.login({ userName, password }),
      user: createdUser,
    };
  }

  async register(body: AuthRegisterApi) {
    const possibleUser = await this.userRepository.findOneByName(body.email);
    if (possibleUser)
      throw new BadRequestException(errorMessage.api('user').EXIST);
    const { userName, password } = body;
    const encryptedPassword = await this.encryptPassword(password);
    const createdUser = await this.userRepository.createUser({
      ...body,
      password: encryptedPassword,
    });
    return {
      access_token: await this.login({ userName, password }),
      user: createdUser,
    };
  }

  async encryptPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, await bcrypt.genSalt(10));
  }
}
