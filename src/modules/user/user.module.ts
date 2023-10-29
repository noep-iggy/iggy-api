import {
  MiddlewareConsumer,
  Module,
  RequestMethod,
  forwardRef,
} from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { User } from './user.entity';
import { AuthMiddleware } from '../auth/auth.middleware';
import { AuthModule } from '../auth/auth.module';
import { MediaModule } from '../media/media.module';
import { HouseModule } from '../house/house.module';
import { TaskModule } from '../task/task.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    forwardRef(() => AuthModule),
    forwardRef(() => MediaModule),
    forwardRef(() => HouseModule),
    forwardRef(() => TaskModule),
  ],
  providers: [UserService],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {
  public configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .forRoutes(
        { path: '/user', method: RequestMethod.ALL },
        { path: '/user/*', method: RequestMethod.ALL },
      );
  }
}
