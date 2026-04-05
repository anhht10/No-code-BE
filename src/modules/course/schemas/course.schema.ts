import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type CourseDocument = HydratedDocument<Course>;

@Schema({
    timestamps: true,
    collection: 'courses',
    toObject: {
        virtuals: true,
        getters: true,
    },
})
export class Course {
    @Prop({ type: String, required: true, trim: true, maxlength: 200 })
    title: string;

    @Prop({
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true,
    })
    slug: string;

    @Prop({ type: String, default: '' })
    description: string;

    @Prop({ type: Number, required: true, min: 0 })
    price: number;

    @Prop({ type: Number, default: 0 }) // seconds hoặc minutes, phải thống nhất
    duration: number;

    @Prop({
        type: String,
        enum: ['beginner', 'intermediate', 'advanced'],
        default: 'beginner',
        index: true,
    })
    level: string;

    @Prop({ type: Number, default: 0 })
    rating: number;

    @Prop({ type: Number, default: 0 })
    studentsCount: number;

    @Prop({ type: String })
    image: string;

    @Prop({ type: Types.ObjectId, ref: 'Industry', required: true, index: true })
    industryId: Types.ObjectId;
}

export const CourseSchema = SchemaFactory.createForClass(Course);