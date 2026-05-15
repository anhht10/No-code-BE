import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Comment } from './schemas/comment.schema';
import { CreateCommentDto, ReactCommentDto } from './dto/create-comment.dto';
import { PusherService } from '../pusher/pusher.service';

@Injectable()
export class CommentService {
  constructor(
    @InjectModel(Comment.name)
    private commentModel: Model<Comment>,
    private readonly pusherService: PusherService,
  ) {}

  async create(userId: string, dto: CreateCommentDto) {
    if (dto.parentId) {
      const parent = await this.commentModel.findById(dto.parentId);

      if (!parent) {
        throw new NotFoundException('Parent comment not found');
      }
    }

    const comment = await this.commentModel.create({
      userId,
      postId: dto.postId,
      parentId: dto.parentId || null,
      content: dto.content,
    });
    const populatedComment = await comment.populate(
      'userId',
      'name avatar role',
    );

    const p = await this.commentModel.findByIdAndUpdate(dto.parentId, {
      $inc: {
        replyCount: 1,
      },
    });
    console.log('Created comment:', p?.replyCount);

    if (dto.parentId) {
      console.log('Triggering pusher for reply:', {
        channel: `reply-${dto.parentId}`,
      });
      await this.pusherService.trigger(
        `reply-${dto.parentId}`,
        'new-comment',
        populatedComment,
      );
      await this.pusherService.trigger(
        `post-${dto.postId}`,
        'update-reply-count',
        {
          commentId: dto.parentId,
          replyCount: p ? p.replyCount + 1 : 0,
        },
      );
    } else {
      await this.pusherService.trigger(
        `post-${dto.postId}`,
        'new-comment',
        populatedComment,
      );
    }

    return populatedComment;
  }

  async findByPost(postId: string) {
    return this.commentModel
      .find({
        postId,
        parentId: null,
      })
      .populate('userId', 'name avatar role')
      .sort({
        createdAt: -1,
      });
  }

  async getReplies(parentId: string) {
    return this.commentModel
      .find({
        parentId,
      })
      .populate('userId', 'name avatar role')
      .sort({
        createdAt: 1,
      })
      .lean();
  }

  async reactComment(commentId: string, userId: string, dto: ReactCommentDto) {
    const comment = await this.commentModel.findById(commentId);

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    const existedReaction = comment.reactions.find(
      (reaction) => reaction.userId.toString() === userId,
    );

    if (existedReaction) {
      existedReaction.type = dto.type;
    } else {
      comment.reactions.push({
        userId: new Types.ObjectId(userId),
        type: dto.type,
      });
    }

    await comment.save();

    if (comment.parentId) {
      await this.pusherService.trigger(
        `reply-${comment.parentId}`,
        'comment-reaction',
        {
          commentId,
          reactions: comment.reactions,
        },
      );
    } else {
      await this.pusherService.trigger(
        `post-${comment.postId}`,
        'comment-reaction',
        {
          commentId,
          reactions: comment.reactions,
        },
      );
    }

    return comment;
  }

  async removeReaction(commentId: string, userId: string) {
    const comment = await this.commentModel.findById(commentId);

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    comment.reactions = comment.reactions.filter(
      (reaction) => reaction.userId.toString() !== userId,
    );

    await comment.save();

    if (comment.parentId) {
      await this.pusherService.trigger(
        `reply-${comment.parentId}`,
        'remove-reaction',
        {
          commentId,
          reactions: comment.reactions,
        },
      );
    } else {
      await this.pusherService.trigger(
        `post-${comment.postId}`,
        'remove-reaction',
        {
          commentId,
          reactions: comment.reactions,
        },
      );
    }

    return comment;
  }

  async remove(commentId: string, user: { userId: string; role: string }) {
    const comment = await this.commentModel.findById(commentId);

    console.log('Removing comment:', commentId, 'by user:', user);
    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    if (comment.userId.toString() !== user.userId && user.role !== 'admin') {
      throw new BadRequestException('No permission');
    }

    await comment.deleteOne();

    if (comment.parentId) {
      await this.pusherService.trigger(
        `reply-${comment.parentId}`,
        'delete-comment',
        {
          commentId,
          reactions: comment.reactions,
        },
      );
      await this.commentModel.findByIdAndUpdate(comment.parentId, {
        $inc: {
          replyCount: -1,
        },
      });
    } else {
      await this.pusherService.trigger(
        `post-${comment.postId}`,
        'delete-comment',
        {
          commentId,
        },
      );
    }

    return {
      message: 'Deleted',
    };
  }
}
