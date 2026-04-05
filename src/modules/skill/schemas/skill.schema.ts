import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type SkillDocument = HydratedDocument<Skill>;

@Schema({
    timestamps: true,
    collection: 'skills',
})
export class Skill {
    @Prop({ type: String, required: true, trim: true, maxlength: 100 })
    name: string;

    @Prop({
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    })
    slug: string;
}

export const SkillSchema = SchemaFactory.createForClass(Skill);