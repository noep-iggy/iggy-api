import { HouseService } from '../house/house.service';
import { MediaService } from '../media/media.service';
import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { errorMessage } from '@/errors';
import { TechRegisterApi, UpdateUserApi, UserDto, UserRoleEnum } from '@/types';
import { decryptObject, encryptObject } from '@/utils';
import { InjectRepository } from '@nestjs/typeorm';
import { TaskService } from '../task/task.service';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    private mediaService: MediaService,
    @Inject(forwardRef(() => HouseService))
    private houseService: HouseService,
    @Inject(forwardRef(() => TaskService))
    private readonly taskService: TaskService,
  ) {}

  formatUser(userCripted: User): UserDto {
    if (!userCripted) return;
    const user = decryptObject(userCripted);
    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName ?? undefined,
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
      const user = await this.userRepository.findOne({
        where: { id: _id },
        relations: ['house', 'tasks', 'profilePicture'],
      });
      return { ...user };
    } catch (error) {
      throw new NotFoundException(errorMessage.api('user').NOT_FOUND, _id);
    }
  }

  async findOneByName(firstName: string): Promise<User | null> {
    const user = await this.userRepository.findOne({
      where: [{ firstName }],
    });
    return user;
  }

  async toggleAdminStatus(id: string): Promise<User> {
    try {
      const user = await this.getUser(id);
      const updatedUser = await this.userRepository.update(id, {
        isAdmin: !user.isAdmin,
      });
      return updatedUser.raw[0];
    } catch (error) {
      throw new BadRequestException(errorMessage.api('user').NOT_UPDATED, id);
    }
  }

  async findOneByEmail(email: string): Promise<User | null> {
    const user = await this.userRepository.findOne({
      where: [{ email }],
    });
    return user;
  }

  async createUser(body: TechRegisterApi, role: UserRoleEnum): Promise<User> {
    try {
      const { email, firstName, isAdmin, password, ...user } = body;
      const encryptUser = encryptObject(user);
      return await this.userRepository.save({
        ...encryptUser,
        email,
        firstName,
        password,
        isAdmin,
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
        relations: ['house', 'tasks'],
      });
    } catch (error) {
      throw new BadRequestException(errorMessage.api('user').NOT_FOUND);
    }
  }

  async updateUser(body: UpdateUserApi, id: string): Promise<User> {
    try {
      const user = await this.getUser(id);
      if (!user)
        throw new BadRequestException(errorMessage.api('user').NOT_FOUND);

      if (body.firstName) {
        const possibleUser = await this.houseService.findUserByNameInHouse(
          body.firstName,
          user.house.id,
        );
        if (possibleUser)
          throw new BadRequestException(errorMessage.api('user').EXIST);
      }
      const profilePictureMedia =
        body.profilePicture &&
        (await this.mediaService.getMediaById(body.profilePicture));

      await this.userRepository.update(id, {
        role: body.role ?? user.role,
        email: body.email ?? user.email,
        firstName: body.firstName ?? user.firstName,
        lastName: body.lastName ?? user.lastName,
        updatedAt: new Date(),
        profilePicture: profilePictureMedia ?? user.profilePicture,
      });

      if (profilePictureMedia) {
        await this.mediaService.deleteMedia(user.profilePicture.id);
      }
      return await this.getUser(id);
    } catch (error) {
      console.log(error);
      throw new BadRequestException(error);
    }
  }

  async deleteUser(id: string): Promise<void> {
    try {
      const tasks = await this.taskService.findTaskByUserId(id);
      await Promise.all(
        tasks.map(async (task) => {
          await this.taskService.deleteTask(task.id);
        }),
      );
      await this.userRepository.delete(id);
    } catch (error) {
      console.log(error);
      throw new BadRequestException(errorMessage.api('user').NOT_FOUND, id);
    }
  }
}
