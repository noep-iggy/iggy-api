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
import { AnimalModule } from '../animal/animal.module';
import { TaskModule } from '../task/task.module';
import { BillingPlanModule } from '../billing-plan/billing-plan.module';
import { AffiliateModule } from '../affiliate/affiliate.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([House]),
    forwardRef(() => AuthModule),
    forwardRef(() => UserModule),
    forwardRef(() => JoinCodeModule),
    forwardRef(() => AnimalModule),
    forwardRef(() => TaskModule),
    forwardRef(() => BillingPlanModule),
    forwardRef(() => AffiliateModule),
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
        { path: '/house', method: RequestMethod.ALL },
        { path: '/house/*', method: RequestMethod.ALL },
      );
  }
}
