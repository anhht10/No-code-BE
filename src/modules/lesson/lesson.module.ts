import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { Course, CourseSchema } from '../course/schemas/course.schema';
import {
  CourseModule,
  CourseModuleSchema,
} from '../course-module/schemas/course-module.schema';
import { LessonAdminController } from './lesson-admin.controller';
import { LessonVideoController } from './lesson-video.controller';
import { LessonService } from './lesson.service';
import { Lesson, LessonSchema } from './schemas/lesson.schema';
import { VideoWatermarkService } from './video-watermark.service';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([
      { name: Lesson.name, schema: LessonSchema },
      { name: CourseModule.name, schema: CourseModuleSchema },
      { name: Course.name, schema: CourseSchema },
    ]),
    JwtModule.register({}),
  ],
  controllers: [LessonAdminController, LessonVideoController],
  providers: [LessonService, VideoWatermarkService],
  exports: [LessonService],
})
export class LessonModule {}
