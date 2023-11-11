import {
  MiddlewareConsumer,
  Module,
  RequestMethod,
  forwardRef,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminUsersController } from './users.controller';
import { AuthMiddleware } from '../auth/auth.middleware';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/user.entity';
import { AuthModule } from '../auth/auth.module';
import { UserModule } from '../user/user.module';
import { HouseModule } from '../house/house.module';
import { MediaModule } from '../media/media.module';
import { AdminHousesController } from './houses.controller';
import { AnimalModule } from '../animal/animal.module';
import { AdminAnimalsController } from './animals.controller';
import { AdminTasksController } from './tasks.controller';
import { TaskModule } from '../task/task.module';
import { AdminAffiliatesController } from './affiliates.controller';
import { AffiliateModule } from '../affiliate/affiliate.module';
import { AdminBillingPlanController } from './billing-plan.controller';
import { BillingPlanModule } from '../billing-plan/billing-plan.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    forwardRef(() => UserModule),
    forwardRef(() => AuthModule),
    forwardRef(() => HouseModule),
    forwardRef(() => MediaModule),
    forwardRef(() => AnimalModule),
    forwardRef(() => BillingPlanModule),
    TaskModule,
    AffiliateModule,
  ],
  providers: [AdminService],
  controllers: [
    AdminUsersController,
    AdminHousesController,
    AdminAnimalsController,
    AdminTasksController,
    AdminAffiliatesController,
    AdminBillingPlanController,
  ],
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
