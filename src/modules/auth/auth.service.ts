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
import { AuthLoginApi, JoinApi, RegisterApi, UserRoleEnum } from '@/types';
import { House } from '../house/house.entity';

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
    const user = await this.userRepository.findOneByEmail(body.email);
    if (!user)
      throw new NotFoundException(
        errorMessage.api('user').NOT_FOUND_OR_WRONG_PASSWORD,
      );
    if (body.password)
      await this.authValidation.validateUser(body.email, body.password);
    const payload = { email: user.email, id: user.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async joinParent(body: JoinApi, house: House) {
    const { password } = body;
    const encryptedPassword = await this.encryptPassword(password);
    const createdUser = await this.userRepository.createUser(
      {
        ...body,
        password: encryptedPassword,
      } as RegisterApi,
      UserRoleEnum.PARENT,
    );
    const usersHouse = await this.userRepository.findUsersByHouseId(house.id);
    await this.houseService.addUserToHouse(createdUser, {
      ...house,
      users: usersHouse,
    });
    const payload = { firstName: createdUser.firstName, id: createdUser.id };
    return {
      access_token: { access_token: this.jwtService.sign(payload) },
      user: createdUser,
    };
  }

  async joinChild(body: JoinApi, house: House) {
    const createdUser = await this.userRepository.createUser(
      body as RegisterApi,
      UserRoleEnum.CHILD,
    );
    const usersHouse = await this.userRepository.findUsersByHouseId(house.id);
    await this.houseService.addUserToHouse(createdUser, {
      ...house,
      users: usersHouse,
    });
    const payload = { userName: createdUser.firstName, id: createdUser.id };
    return {
      access_token: { access_token: this.jwtService.sign(payload) },
      user: createdUser,
    };
  }

  async register(body: RegisterApi) {
    const { password, email } = body;
    const possibleUser = await this.userRepository.findOneByEmail(email);
    if (possibleUser)
      throw new BadRequestException(errorMessage.api('user').EXIST);
    const encryptedPassword = await this.encryptPassword(password);
    const createdUser = await this.userRepository.createUser(
      {
        ...body,
        password: encryptedPassword,
      },
      UserRoleEnum.PARENT,
    );
    return {
      access_token: await this.login({ email, password }),
      user: createdUser,
    };
  }

  async encryptPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, await bcrypt.genSalt(10));
  }
}
