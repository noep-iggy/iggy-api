import {
  MiddlewareConsumer,
  Module,
  RequestMethod,
  forwardRef,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { AuthMiddleware } from '../auth/auth.middleware';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/user.entity';
import { AuthModule } from '../auth/auth.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    UserModule,
    AuthModule,
    forwardRef(() => AuthModule),
  ],
  providers: [AdminService],
  controllers: [AdminController],
})
export class AdminModule {
  public configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .forRoutes(
        { path: '/admin', method: RequestMethod.ALL },
        { path: '/admin/*', method: RequestMethod.ALL },
      );
  }
}
