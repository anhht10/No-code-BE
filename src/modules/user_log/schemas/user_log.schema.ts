import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type UserLogDocument = HydratedDocument<UserLog>;

@Schema({
    timestamps: false,
    collection: 'user_logs',
})
export class UserLog {
    @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
    userId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'Course', index: true })
    courseId: Types.ObjectId;

    @Prop({ type: Date, default: Date.now, index: true })
    timestamp: Date;

    @Prop({
        type: String,
        enum: ['view_course', 'enroll', 'complete_lesson'],
        required: true,
        index: true,
    })
    action: string;
}

export const UserLogSchema = SchemaFactory.createForClass(UserLog);