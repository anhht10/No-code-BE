import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type CourseSkillDocument = HydratedDocument<CourseSkill>;

@Schema({
    timestamps: true,
    collection: 'course_skills',
})
export class CourseSkill {
    @Prop({ type: Types.ObjectId, ref: 'Course', required: true, index: true })
    courseId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'Skill', required: true, index: true })
    skillId: Types.ObjectId;
}

export const CourseSkillSchema = SchemaFactory.createForClass(CourseSkill);