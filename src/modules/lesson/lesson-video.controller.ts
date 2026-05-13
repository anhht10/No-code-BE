import { Controller, Get, Param, Req, Res } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { Public } from '../auth/decorators/public.decorator';
import { SkipResponseTransform } from '../../common/decorators/skip-response-transform.decorator';
import { LessonService } from './lesson.service';

@ApiTags('Lessons')
@Controller('lessons')
export class LessonVideoController {
  constructor(private readonly lessonService: LessonService) {}

  @Public()
  @SkipResponseTransform()
  @Get(':lessonId/video')
  @ApiOperation({
    summary:
      'Stream lesson video (JWT: Authorization Bearer hoặc query access_token)',
  })
  async stream(
    @Param('lessonId') lessonId: string,
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    await this.lessonService.streamLessonVideo(lessonId, req, res);
  }
}
