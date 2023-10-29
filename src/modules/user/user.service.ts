import { HouseService } from '../house/house.service';
import { MediaService } from '../media/media.service';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { errorMessage } from '@/errors';
import { UserDto, UpdateUserApi, UserRoleEnum, AuthRegisterApi } from '@/types';
import { decryptObject, encryptObject } from '@/utils';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    private mediaService: MediaService,
    private houseService: HouseService,
  ) {}

  formatUser(userCripted: User): UserDto {
    if (!userCripted) return;
    const user = decryptObject(userCripted);
    return {
      id: user.id,
      userName: user.userName,
      email: user.email ?? undefined,
      tasks:
        user.tasks && user.tasks.length > 0
          ? user.tasks.map((task) => task.id)
          : undefined,
      role: user.role,
      house: this.houseService.formatHouse(user?.house),
      updatedAt: user.updatedAt,
      createdAt: user.createdAt,
      profilePicture: this.mediaService.formatMedia(user?.profilePicture),
    };
  }

  async getUsers(): Promise<User[]> {
    try {
      return await this.userRepository.find();
    } catch (error) {
      throw new BadRequestException(errorMessage.api('user').NOT_FOUND);
    }
  }

  async getUser(_id: string): Promise<User> {
    try {
      const user = await this.userRepository.findOneBy({ id: _id });
      return { ...user };
    } catch (error) {
      throw new NotFoundException(errorMessage.api('user').NOT_FOUND, _id);
    }
  }

  async findOneByName(userName: string): Promise<User | null> {
    const user = await this.userRepository.findOne({
      where: [{ userName }],
    });
    return user;
  }

  async createUser(body: AuthRegisterApi, role: UserRoleEnum): Promise<User> {
    try {
      const { email, userName, password, ...user } = body;
      const encryptUser = encryptObject(user);
      return await this.userRepository.save({
        ...encryptUser,
        email,
        userName,
        password,
        role,
        profilePicture: null,
      });
    } catch (error) {
      console.log(error);
      throw new BadRequestException(errorMessage.api('user').NOT_CREATED);
    }
  }

  async findUsersByHouseId(houseId: string): Promise<User[]> {
    try {
      return await this.userRepository.find({
        where: {
          house: {
            id: houseId,
          },
        },
      });
    } catch (error) {
      throw new BadRequestException(errorMessage.api('user').NOT_FOUND);
    }
  }

  async updateUser(body: UpdateUserApi, id: string): Promise<User> {
    try {
      if (body.userName) {
        const possibleUser = await this.findOneByName(body.userName);
        if (possibleUser)
          throw new BadRequestException(errorMessage.api('user').EXIST);
      }
      const user = await this.getUser(id);
      const profilePictureMedia =
        body.profilePicture &&
        (await this.mediaService.getMediaById(body.profilePicture));

      await this.userRepository.update(id, {
        ...user,
        role: body.role ?? user.role,
        email: body.email ?? user.email,
        userName: body.userName ?? user.userName,
        updatedAt: new Date(),
        profilePicture: profilePictureMedia ?? user.profilePicture,
      });

      if (profilePictureMedia) {
        await this.mediaService.deleteMedia(user.profilePicture.id);
      }
      return await this.getUser(id);
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async deleteUser(id: string): Promise<void> {
    try {
      const user = await this.getUser(id);
      await this.userRepository.delete(user.id);
    } catch (error) {
      throw new BadRequestException(errorMessage.api('user').NOT_FOUND, id);
    }
  }
}
