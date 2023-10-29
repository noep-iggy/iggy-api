import {
  MiddlewareConsumer,
  Module,
  RequestMethod,
  forwardRef,
} from '@nestjs/common';
import { JoinCodeService } from './join-code.service';
import { JoinCode } from './join-code.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthMiddleware } from '../auth/auth.middleware';
import { AuthModule } from '../auth/auth.module';
import { UserModule } from '../user/user.module';
import { JoincodeController } from './join-code.controller';
import { HouseModule } from '../house/house.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([JoinCode]),
    forwardRef(() => AuthModule),
    forwardRef(() => UserModule),
    forwardRef(() => HouseModule),
  ],
  providers: [JoinCodeService],
  controllers: [JoincodeController],
  exports: [JoinCodeService],
})
export class JoinCodeModule {
  public configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .forRoutes(
        { path: '/join-codes', method: RequestMethod.ALL },
        { path: '/join-codes/*', method: RequestMethod.ALL },
      );
  }
}
