import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Lesson, LessonSchema } from './schemas/lesson.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: Lesson.name, schema: LessonSchema }])],
})
export class LessonModule {}
