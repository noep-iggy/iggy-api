import {
  MiddlewareConsumer,
  Module,
  RequestMethod,
  forwardRef,
} from '@nestjs/common';
import { BillingPlanService } from './billing-plan.service';
import { BillingPlanController } from './billing-plan.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { AuthMiddleware } from '../auth/auth.middleware';
import { BillingPlan } from './billing-plan.entity';
import { UserModule } from '../user/user.module';
import { HouseModule } from '../house/house.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([BillingPlan]),
    forwardRef(() => AuthModule),
    forwardRef(() => UserModule),
    forwardRef(() => HouseModule),
  ],
  providers: [BillingPlanService],
  controllers: [BillingPlanController],
  exports: [BillingPlanService],
})
export class BillingPlanModule {
  public configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .forRoutes(
        { path: '/billing-plans', method: RequestMethod.ALL },
        { path: '/billing-plans/*', method: RequestMethod.ALL },
      );
  }
}
