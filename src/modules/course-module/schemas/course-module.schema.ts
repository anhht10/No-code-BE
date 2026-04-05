import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type CourseModuleDocument = HydratedDocument<CourseModule>;

@Schema({
    timestamps: true,
    collection: 'course_modules',
    toObject: {
        virtuals: true,
        getters: true,
    },
})
export class CourseModule {
    @Prop({ type: Types.ObjectId, ref: 'Course', required: true, index: true })
    courseId: Types.ObjectId;

    @Prop({ type: String, required: true, trim: true, maxlength: 200 })
    title: string;

    @Prop({ type: Number, required: true, min: 1 })
    order: number;

}

export const CourseModuleSchema = SchemaFactory.createForClass(CourseModule);