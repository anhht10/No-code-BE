import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type LessonDocument = HydratedDocument<Lesson>;

@Schema({
    timestamps: true,
    collection: 'lessons',
    toObject: {
        virtuals: true,
        getters: true,
    },
})
export class Lesson {
    @Prop({ type: String, required: true, trim: true, maxlength: 200 })
    title: string;

    @Prop({ type: Types.ObjectId, ref: 'Course', required: true, index: true })
    courseId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'CourseModule', required: true, index: true })
    moduleId: Types.ObjectId;

    @Prop({
        type: String,
        enum: ['video', 'article', 'quiz'],
        required: true,
        index: true,
    })
    type: string;

    @Prop({ type: Number, default: 0 })
    duration: number;

    @Prop({ type: Number, required: true, min: 1 })
    order: number;

}

export const LessonSchema = SchemaFactory.createForClass(Lesson);