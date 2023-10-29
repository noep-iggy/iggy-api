import {
  MiddlewareConsumer,
  Module,
  RequestMethod,
  forwardRef,
} from '@nestjs/common';
import { AnimalService } from './animal.service';
import { AnimalController } from './animal.controller';
import { Animal } from './animal.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthMiddleware } from '../auth/auth.middleware';
import { AuthModule } from '../auth/auth.module';
import { HouseModule } from '../house/house.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Animal]),
    forwardRef(() => AuthModule),
    forwardRef(() => UserModule),
    forwardRef(() => HouseModule),
  ],
  providers: [AnimalService],
  controllers: [AnimalController],
  exports: [AnimalService],
})
export class AnimalModule {
  public configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .forRoutes(
        { path: '/animals', method: RequestMethod.ALL },
        { path: '/animals/*', method: RequestMethod.ALL },
      );
  }
}
