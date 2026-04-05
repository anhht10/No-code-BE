import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({
    timestamps: true,
    collection: 'users',
})
export class User {
    @Prop({ type: String, required: true, unique: true, trim: true })
    username: string;

    @Prop({ type: String, required: true, trim: true })
    name: string;

    @Prop({
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    })
    email: string;

    @Prop({ type: String, required: true })
    password: string;

    @Prop({ type: String })
    avatar: string;

    @Prop({
        type: String,
        enum: ['male', 'female', 'other'],
    })
    gender: string;

    @Prop({
        type: String,
        enum: ['student', 'instructor', 'admin'],
        default: 'student',
        index: true,
    })
    role: string;
}

export const UserSchema = SchemaFactory.createForClass(User);