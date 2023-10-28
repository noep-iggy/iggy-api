import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { AuthService } from '../auth/auth.service';
import { User } from '../user/user.entity';
import { UserService } from '../user/user.service';
import { errorMessage } from '@/errors';
import { UserDto, UpdateUserApi, UserRoleEnum } from '@/types';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User) private adminRepository: Repository<User>,
    private usersService: UserService,
    private authService: AuthService,
  ) {}

  async loadAdmin() {
    const adminBody = {
      userName: 'admin',
      email: 'admin@gmail.com',
      password: 'Azerty123!',
      role: UserRoleEnum.ADMIN,
    };
    try {
      const admin = await this.adminRepository.findOne({
        where: [{ email: adminBody.email }],
      });
      if (!admin) {
        const { access_token } = await this.authService.register(adminBody);
        return access_token;
      } else {
        return admin;
      }
    } catch (error) {
      throw new BadRequestException(errorMessage.api('admin').NOT_FOUND);
    }
  }

  async toggleAdminStatus(user: User, id: string): Promise<UserDto> {
    if (user.role === UserRoleEnum.ADMIN) {
      if (user.id === id)
        throw new BadRequestException(
          errorMessage.api('admin').CANNOT_CHANGE_OWN_STATUS,
        );
      try {
        const newAdmin = await this.usersService.getUser(id);
        const updatedUser = await this.adminRepository.update(newAdmin.id, {
          role: UserRoleEnum.CHILD,
        });
        return updatedUser.raw;
      } catch (error) {
        throw new BadRequestException(errorMessage.api('admin').NOT_FOUND);
      }
    } else {
      throw new UnauthorizedException(errorMessage.api('admin').NOT_ADMIN);
    }
  }

  async getUser(user: User, id: string): Promise<User> {
    if (user.role === UserRoleEnum.ADMIN) {
      return await this.usersService.getUser(id);
    } else {
      throw new UnauthorizedException(errorMessage.api('admin').NOT_ADMIN);
    }
  }

  async updateUser(user: User, id: string, body: UpdateUserApi): Promise<User> {
    if (user.role === UserRoleEnum.ADMIN) {
      return await this.usersService.updateUser(body, id);
    } else {
      throw new UnauthorizedException(errorMessage.api('admin').NOT_ADMIN);
    }
  }

  async deleteUser(user: User, id: string): Promise<void> {
    if (user.role === UserRoleEnum.ADMIN) {
      return await this.usersService.deleteUser(id);
    } else {
      throw new UnauthorizedException(errorMessage.api('admin').NOT_ADMIN);
    }
  }
}
