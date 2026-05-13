import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { join } from 'path';
import { mkdirSync } from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { JwtAuthGuard } from '../auth/gaurds/jwt-auth.guard';
import { AdminRoleGuard } from '../auth/gaurds/admin-role.guard';
import { ResponseMessage } from '../../common/decorators/response-message.decorator';
import { ImportOutlineDto } from './dto/lesson-admin.dto';
import { LessonService } from './lesson.service';

const VIDEO_SUBDIR = 'lesson-videos';
const ALLOWED_VIDEO_EXT = new Set(['.mp4', '.webm', '.mov', '.mkv']);

@ApiTags('Admin Lessons')
@ApiBearerAuth()
@Controller('admin/lessons')
@UseGuards(JwtAuthGuard, AdminRoleGuard)
export class LessonAdminController {
  constructor(private readonly lessonService: LessonService) {}

  @Get()
  @ResponseMessage('Lấy danh sách bài học theo khóa học')
  @ApiOperation({ summary: 'List lessons for a course (admin)' })
  async listByCourse(@Query('courseId') courseId: string) {
    if (!courseId) {
      throw new BadRequestException('Thiếu query courseId');
    }
    return this.lessonService.findByCourseId(courseId);
  }

  @Post('import-outline')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  @ResponseMessage('Import dàn bài học thành công')
  @ApiOperation({
    summary: 'Import nhiều bài học (tự tạo chương nếu chưa có theo moduleTitle)',
  })
  async importOutline(@Body() dto: ImportOutlineDto) {
    return this.lessonService.importOutline(dto);
  }

  @Post(':lessonId/video')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { file: { type: 'string', format: 'binary' } },
    },
  })
  @ResponseMessage('Tải video bài học thành công')
  @ApiOperation({ summary: 'Upload lesson video file (mp4, webm, mov, mkv)' })
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 500 * 1024 * 1024 },
      storage: diskStorage({
        destination: (_req, _file, cb) => {
          const dir = join(process.cwd(), 'uploads', VIDEO_SUBDIR);
          mkdirSync(dir, { recursive: true });
          cb(null, dir);
        },
        filename: (req, _file, cb) => {
          const ext = (req as Express.Request & { lessonUploadExt?: string })
            .lessonUploadExt;
          cb(null, `${uuidv4()}${ext || '.mp4'}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        const lower = file.originalname.toLowerCase();
        const dot = lower.lastIndexOf('.');
        const ext = dot >= 0 ? lower.slice(dot) : '';
        if (!ALLOWED_VIDEO_EXT.has(ext)) {
          return cb(
            new BadRequestException(
              `Định dạng không được hỗ trợ. Chấp nhận: ${[...ALLOWED_VIDEO_EXT].join(', ')}`,
            ) as Error,
            false,
          );
        }
        (req as Express.Request & { lessonUploadExt?: string }).lessonUploadExt =
          ext;
        cb(null, true);
      },
    }),
  )
  async uploadVideo(
    @Param('lessonId') lessonId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('Thiếu file video');
    }
    return this.lessonService.attachVideoFile(lessonId, file.filename);
  }

  @Delete(':lessonId/video')
  @ResponseMessage('Đã xóa video bài học')
  @ApiOperation({ summary: 'Remove hosted video file for a lesson' })
  async deleteVideo(@Param('lessonId') lessonId: string) {
    return this.lessonService.clearVideoFile(lessonId);
  }
}
