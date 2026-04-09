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

    @Prop({ type: String, default: '' })
    summary?: string;

    @Prop({ type: String, default: '' })
    content?: string;

    @Prop({ type: String, default: '' })
    videoUrl?: string;

    @Prop({ type: String, default: '' })
    resourceUrl?: string;

    @Prop({ type: String, default: '' })
    thumbnail?: string;

    @Prop({ type: Boolean, default: false })
    isPreview?: boolean;

}

export const LessonSchema = SchemaFactory.createForClass(Lesson);