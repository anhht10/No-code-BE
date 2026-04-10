import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { PostCategory } from '../../post-category/schemas/post-category.schema';
import { Post } from '@nestjs/common';

export enum StatusSchedulePost {
  TODO = 'todo',
  DONE = 'done',
  PENDING = 'pending',
}
@Schema({
  timestamps: true,
  toObject: {
    virtuals: true,
    getters: true,
  },
})
export class PostSchedule {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: PostCategory.name })
  categoryId: string;

  @Prop({ type: Date, required: true })
  scheduleAt: Date;

  @Prop({ type: String, required: true })
  keywords: string;

  @Prop({ type: String, required: true })
  campain_description: string;

  @Prop({ type: String, required: true })
  writing_tone: string;

  @Prop({ type: String, required: true })
  target_audience: string;

  @Prop({ type: String, required: true })
  industry: string;

  @Prop({
    type: String,
    enum: StatusSchedulePost,
    default: StatusSchedulePost.TODO,
  })
  status: StatusSchedulePost;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Post.name })
  postId: string;
}

export const PostScheduleSchema = SchemaFactory.createForClass(PostSchedule);