import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Skill, SkillSchema } from './schemas/skill.schema';
import { SkillController } from './skill.controller';
import { SkillService } from './skill.service';
import { SlugCounterModule } from '../slug-counter/slug-counter.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Skill.name, schema: SkillSchema }]),
    SlugCounterModule
  ],
  controllers: [SkillController],
  providers: [SkillService],
})
export class SkillModule {}
