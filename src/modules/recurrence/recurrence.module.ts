import {
  MiddlewareConsumer,
  Module,
  RequestMethod,
  forwardRef,
} from '@nestjs/common';
import { RecurrenceService } from './recurrence.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Recurrence } from './recurrence.entity';
import { AuthMiddleware } from '../auth/auth.middleware';
import { AuthModule } from '../auth/auth.module';
import { UserModule } from '../user/user.module';
import { RecurrenceController } from './recurrence.controller';
import { TaskModule } from '../task/task.module';

@Module({
  imports: [
    forwardRef(() => TaskModule),
    TypeOrmModule.forFeature([Recurrence]),
    forwardRef(() => AuthModule),
    forwardRef(() => UserModule),
  ],
  providers: [RecurrenceService],
  controllers: [RecurrenceController],
  exports: [RecurrenceService],
})
export class RecurrenceModule {
  public configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .forRoutes(
        { path: '/recurrences', method: RequestMethod.ALL },
        { path: '/recurrences/*', method: RequestMethod.ALL },
      );
  }
}
