import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
} from '@nestjs/common';

import { CreateCommentDto, ReactCommentDto } from './dto/create-comment.dto';
import { CommentService } from './comments.service';

@Controller('comments')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Post()
  create(@Req() req: any, @Body() dto: CreateCommentDto) {
    const userId = req.user?.userId || req.user?._id || req.user?.id;
    console.log('Creating comment with userId:', userId, 'and data:', dto);
    return this.commentService.create(userId, dto);
  }

  @Get('post/:postId')
  findByPost(@Param('postId') postId: string) {
    return this.commentService.findByPost(postId);
  }

  @Get(':id/replies')
  getReplies(
    @Param('id')
    id: string,
  ) {
    return this.commentService.getReplies(id);
  }

  @Post(':id/react')
  react(
    @Param('id') id: string,
    @Req() req: any,
    @Body() dto: ReactCommentDto,
  ) {
    const userId = req.user?.userId || req.user?._id || req.user?.id;
    return this.commentService.reactComment(id, userId, dto);
  }

  @Delete(':id/react')
  removeReaction(@Param('id') id: string, @Req() req: any) {
    const userId = req.user?.userId || req.user?._id || req.user?.id;
    return this.commentService.removeReaction(id, userId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: any) {
    return this.commentService.remove(id, req.user);
  }
}
