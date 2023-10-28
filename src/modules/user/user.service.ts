import { HouseService } from '../house/house.service';
import { MediaService } from '../media/media.service';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { userValidation } from '@/validations';
import { errorMessage } from '@/errors';
import { UserDto, AuthRegisterApi, UpdateUserApi } from '@/types';
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
      email: user.email,
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

  async findOneByName(name: string): Promise<User | null> {
    const user = await this.userRepository.findOne({
      where: [{ userName: name }],
    });
    return decryptObject(user);
  }

  async createUser(body: AuthRegisterApi): Promise<User> {
    try {
      const { email, userName, password, ...user } = body;
      const encryptUser = encryptObject(user);
      return await this.userRepository.save({
        ...encryptUser,
        email,
        userName,
        password,
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
      await userValidation.update.validate(body, {
        abortEarly: false,
      });
    } catch (e) {
      throw new BadRequestException(e.errors);
    }
    try {
      const user = await this.getUser(id);

      const profilePictureMedia =
        body.profilePicture &&
        (await this.mediaService.getMediaById(body.profilePicture));

      await this.userRepository.update(id, {
        ...user,
        email: body.email ?? user.email,
        userName: body.userName ?? user.userName,
        profilePicture: profilePictureMedia ?? user.profilePicture,
      });

      if (profilePictureMedia) {
        await this.mediaService.deleteMedia(user.profilePicture.id);
      }
      return await this.getUser(id);
    } catch (error) {
      throw new BadRequestException(errorMessage.api('user').NOT_UPDATED, id);
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
