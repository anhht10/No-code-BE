import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserLog, UserLogSchema } from './schemas/user_log.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: UserLog.name, schema: UserLogSchema }])],
})
export class UserLogModule {}
