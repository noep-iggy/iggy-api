import { Module } from '@nestjs/common';
import { AffiliateService } from './affiliate.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Affiliate } from './affiliate.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Affiliate])],
  providers: [AffiliateService],
  controllers: [],
  exports: [AffiliateService],
})
export class AffiliateModule {}
