import {
  MiddlewareConsumer,
  Module,
  RequestMethod,
  forwardRef,
} from '@nestjs/common';
import { HouseService } from './house.service';
import { HouseController } from './house.controller';
import { AuthMiddleware } from '../auth/auth.middleware';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { House } from './house.entity';
import { UserModule } from '../user/user.module';
import { JoinCodeModule } from '../join-code/join-code.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([House]),
    forwardRef(() => AuthModule),
    forwardRef(() => UserModule),
    forwardRef(() => JoinCodeModule),
  ],
  providers: [HouseService],
  controllers: [HouseController],
  exports: [HouseService],
})
export class HouseModule {
  public configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .forRoutes(
        { path: '/houses', method: RequestMethod.ALL },
        { path: '/houses/*', method: RequestMethod.ALL },
      );
  }
}
