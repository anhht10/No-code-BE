import { Module } from '@nestjs/common';
import { PostSchedulesService } from './post-schedules.service';
import { PostSchedulesController } from './post-schedules.controller';
import {
  PostSchedule,
  PostScheduleSchema,
} from './schemas/post-schedule.schema';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PostSchedule.name, schema: PostScheduleSchema },
    ]),
  ],
  controllers: [PostSchedulesController],
  providers: [PostSchedulesService],
})
export class PostSchedulesModule {}