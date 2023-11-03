import {
  MiddlewareConsumer,
  Module,
  RequestMethod,
  forwardRef,
} from '@nestjs/common';
import { AffiliateService } from './affiliate.service';
import { AffiliateController } from './affiliate.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthMiddleware } from '../auth/auth.middleware';
import { AuthModule } from '../auth/auth.module';
import { UserModule } from '../user/user.module';
import { Affiliate } from './affiliate.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Affiliate]),
    forwardRef(() => AuthModule),
    forwardRef(() => UserModule),
  ],
  providers: [AffiliateService],
  controllers: [AffiliateController],
  exports: [AffiliateService],
})
export class AffiliateModule {
  public configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .forRoutes(
        { path: '/affiliates', method: RequestMethod.ALL },
        { path: '/affiliates/*', method: RequestMethod.ALL },
      );
  }
}
