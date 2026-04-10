import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type IndustryDocument = HydratedDocument<Industry>;

@Schema({
  timestamps: true,
  collection: 'industries',
  toObject: {
    virtuals: true,
    getters: true,
  },
})
export class Industry {
  @Prop({ type: String, required: true, trim: true, maxlength: 150 })
  name: string;

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
}

export const IndustrySchema = SchemaFactory.createForClass(Industry);

