import {
  MiddlewareConsumer,
  Module,
  RequestMethod,
  forwardRef,
} from '@nestjs/common';
import { TaskService } from './task.service';
import { TaskController } from './task.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { UserModule } from '../user/user.module';
import { AuthMiddleware } from '../auth/auth.middleware';
import { Task } from './task.entity';
import { AnimalModule } from '../animal/animal.module';
import { MediaModule } from '../media/media.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Task]),
    forwardRef(() => AuthModule),
    forwardRef(() => UserModule),
    forwardRef(() => AnimalModule),
    forwardRef(() => MediaModule),
  ],
  providers: [TaskService],
  controllers: [TaskController],
  exports: [TaskService],
})
export class TaskModule {
  public configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .forRoutes(
        { path: '/tasks', method: RequestMethod.ALL },
        { path: '/tasks/*', method: RequestMethod.ALL },
      );
  }
}
