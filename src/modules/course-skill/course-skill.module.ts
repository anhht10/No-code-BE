import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CourseSkill, CourseSkillSchema } from './schemas/course-skill.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: CourseSkill.name, schema: CourseSkillSchema }])],
})
export class CourseSkillModule {}
