import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class SlugCounter {
  @Prop({ type: String, required: true })
  declare _id: string;

  @Prop({ type: Number, required: true, default: 0 })
  seq: number;
}
export const SlugCounterSchema = SchemaFactory.createForClass(SlugCounter);
