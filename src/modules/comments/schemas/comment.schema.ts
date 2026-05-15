import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Types } from 'mongoose';
import { User } from '../../user/schemas/user.schema';
import { Post } from '../../post/schemas/post.schemas';

@Schema({
  timestamps: true,
})
export class Comment {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: User.name,
    required: true,
  })
  userId: Types.ObjectId;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: Post.name,
    required: true,
  })
  postId: Types.ObjectId;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: Comment.name,
    default: null,
    index: true,
  })
  parentId: Types.ObjectId | null;

  @Prop({
    default: 0,
  })
  replyCount: number;

  @Prop({
    required: true,
    trim: true,
  })
  content: string;

  @Prop({
    type: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: User.name,
        },

        type: {
          type: String,
          enum: ['like', 'dislike'],
        },
      },
    ],
    default: [],
  })
  reactions: {
    userId: Types.ObjectId;
    type: string;
  }[];
}

export const CommentSchema = SchemaFactory.createForClass(Comment);
