import { Module, forwardRef } from '@nestjs/common';
import { BillingPlanService } from './billing-plan.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { BillingPlan } from './billing-plan.entity';
import { UserModule } from '../user/user.module';
import { HouseModule } from '../house/house.module';
import { BillingPlanController } from './billing-plan.controller';

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
export class BillingPlanModule {}
