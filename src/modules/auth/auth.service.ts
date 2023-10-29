import { JoinCodeService } from './../join-code/join-code.service';
import { HouseService } from './../house/house.service';
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
import { AuthLoginApi, AuthRegisterApi, UserRoleEnum } from '@/types';

@Injectable()
export class AuthService {
  constructor(
    private userRepository: UserService,
    private authValidation: AuthValidation,
    private jwtService: JwtService,
    private houseService: HouseService,
    private joinCodeService: JoinCodeService,
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

  async join(body: AuthRegisterApi, code: string) {
    const { userName, password } = body;
    const joinCode = await this.joinCodeService.getJoincode(code);
    if (!joinCode)
      throw new NotFoundException(errorMessage.api('joincode').NOT_FOUND);
    const possibleUser = await this.userRepository.findOneByName(userName);
    if (possibleUser)
      throw new BadRequestException(errorMessage.api('user').EXIST);
    const encryptedPassword = await this.encryptPassword(password);
    const createdUser = await this.userRepository.createUser(
      {
        ...body,
        password: encryptedPassword,
      },
      joinCode.type === 'PARENT' ? UserRoleEnum.PARENT : UserRoleEnum.CHILD,
    );
    const usersHouse = await this.userRepository.findUsersByHouseId(
      joinCode.house.id,
    );
    await this.houseService.addUserToHouse(createdUser, {
      ...joinCode.house,
      users: usersHouse,
    });
    return {
      access_token: await this.login({ userName, password }),
      user: createdUser,
    };
  }

  async register(body: AuthRegisterApi) {
    const possibleUser = await this.userRepository.findOneByName(body.userName);
    if (possibleUser)
      throw new BadRequestException(errorMessage.api('user').EXIST);
    const { userName, password } = body;
    const encryptedPassword = await this.encryptPassword(password);
    const createdUser = await this.userRepository.createUser(
      {
        ...body,
        password: encryptedPassword,
      },
      UserRoleEnum.PARENT,
    );
    return {
      access_token: await this.login({ userName, password }),
      user: createdUser,
    };
  }

  async encryptPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, await bcrypt.genSalt(10));
  }
}
