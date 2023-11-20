import {
  MiddlewareConsumer,
  Module,
  RequestMethod,
  forwardRef,
} from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthMiddleware } from '../auth/auth.middleware';
import { AuthModule } from '../auth/auth.module';
import { MediaModule } from '../media/media.module';
import { UserModule } from '../user/user.module';
import { AffiliateController } from './affiliate.controller';
import { Affiliate } from './affiliate.entity';
import { AffiliateService } from './affiliate.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Affiliate]),
    forwardRef(() => MediaModule),
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
