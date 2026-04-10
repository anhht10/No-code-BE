import { Module } from '@nestjs/common';
import { PostSchedulesService } from './post-schedules.service';
import { PostSchedulesController } from './post-schedules.controller';

@Module({
  controllers: [PostSchedulesController],
  providers: [PostSchedulesService],
})
export class PostSchedulesModule {}
