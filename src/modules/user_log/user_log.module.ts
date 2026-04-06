import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserLog, UserLogSchema } from './schemas/user_log.schema';
import { TrackingController } from './tracking.controller';
import { TrackingService } from './tracking.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: UserLog.name, schema: UserLogSchema }])],
  controllers: [TrackingController],
  providers: [TrackingService],
})
export class UserLogModule {}
