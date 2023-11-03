import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import { ConfigModule } from '@nestjs/config';
import { MulterModule } from '@nestjs/platform-express';
import { ServeStaticModule } from '@nestjs/serve-static';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { AdminModule } from './modules/admin/admin.module';
import { FileUploadModule } from './modules/file-upload/file-upload.module';
import { MediaModule } from './modules/media/media.module';
import { HouseModule } from './modules/house/house.module';
import { JoinCodeModule } from './modules/join-code/join-code.module';
import { ScheduleModule } from '@nestjs/schedule';
import { AnimalModule } from './modules/animal/animal.module';
import { TaskModule } from './modules/task/task.module';
import { RecurrenceModule } from './modules/recurrence/recurrence.module';
import { BillingPlanModule } from './modules/billing-plan/billing-plan.module';
import { AffiliateModule } from './modules/affiliate/affiliate.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.TYPEORM_HOST,
      port: Number(process.env.TYPEORM_PORT),
      username: process.env.TYPEORM_USERNAME,
      password: process.env.TYPEORM_PASSWORD,
      database: process.env.TYPEORM_DATABASE,
      entities: [join(__dirname, '**', '*.entity.{ts,js}')],
    }),
    MulterModule.register({
      dest: process.env.FILES_PATH,
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
    }),
    UserModule,
    AuthModule,
    AdminModule,
    FileUploadModule,
    MediaModule,
    HouseModule,
    JoinCodeModule,
    AnimalModule,
    TaskModule,
    RecurrenceModule,
    BillingPlanModule,
    AffiliateModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
