import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CourseModule, CourseModuleSchema } from './schemas/course-module.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: CourseModule.name, schema: CourseModuleSchema }])],
})
export class CourseModuleModule {}
