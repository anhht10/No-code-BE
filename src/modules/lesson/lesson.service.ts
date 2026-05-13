import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { createReadStream, existsSync, mkdirSync, unlinkSync } from 'fs';
import { statSync } from 'fs';
import { basename, extname, join } from 'path';
import { Model, Types } from 'mongoose';
import type { Response } from 'express';
import type { Request } from 'express';
import { Course, CourseDocument } from '../course/schemas/course.schema';
import {
  CourseModule,
  CourseModuleDocument,
} from '../course-module/schemas/course-module.schema';
import { Lesson, LessonDocument } from './schemas/lesson.schema';
import { ImportOutlineDto } from './dto/lesson-admin.dto';
import { VideoWatermarkService } from './video-watermark.service';

const VIDEO_SUBDIR = 'lesson-videos';
const ALLOWED_VIDEO_EXT = new Set(['.mp4', '.webm', '.mov', '.mkv']);

@Injectable()
export class LessonService {
  private readonly uploadRoot: string;

  constructor(
    @InjectModel(Lesson.name) private readonly lessonModel: Model<LessonDocument>,
    @InjectModel(CourseModule.name)
    private readonly courseModuleModel: Model<CourseModuleDocument>,
    @InjectModel(Course.name) private readonly courseModel: Model<CourseDocument>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly videoWatermark: VideoWatermarkService,
  ) {
    this.uploadRoot = join(process.cwd(), 'uploads', VIDEO_SUBDIR);
    mkdirSync(this.uploadRoot, { recursive: true });
  }

  getAbsolutePathForKey(fileKey: string): string {
    const safe = fileKey.replace(/[/\\]/g, '');
    return join(this.uploadRoot, safe);
  }

  async findByCourseId(courseId: string): Promise<LessonDocument[]> {
    if (!Types.ObjectId.isValid(courseId)) {
      throw new BadRequestException('courseId không hợp lệ');
    }
    return this.lessonModel
      .find({ courseId: new Types.ObjectId(courseId) })
      .sort({ order: 1 })
      .lean()
      .exec();
  }

  async findById(lessonId: string): Promise<LessonDocument | null> {
    if (!Types.ObjectId.isValid(lessonId)) return null;
    return this.lessonModel.findById(lessonId).exec();
  }

  async attachVideoFile(lessonId: string, diskFileName: string) {
    if (!Types.ObjectId.isValid(lessonId)) {
      throw new BadRequestException('lessonId không hợp lệ');
    }
    const lesson = await this.lessonModel.findById(lessonId);
    if (!lesson) throw new NotFoundException('Không tìm thấy bài học');
    if (lesson.videoFileKey) {
      const oldPath = this.getAbsolutePathForKey(lesson.videoFileKey);
      if (existsSync(oldPath)) {
        try {
          unlinkSync(oldPath);
        } catch {
          /* ignore */
        }
      }
    }
    const inputPath = this.getAbsolutePathForKey(diskFileName);
    if (!existsSync(inputPath)) {
      throw new BadRequestException('Không tìm thấy file vừa upload');
    }
    const stem = basename(diskFileName, extname(diskFileName));
    const outputKey = `${stem}-wm.mp4`;
    const outputPath = this.getAbsolutePathForKey(outputKey);
    try {
      await this.videoWatermark.burnFixedWatermark(inputPath, outputPath);
    } catch (e: any) {
      try {
        if (existsSync(outputPath)) unlinkSync(outputPath);
      } catch {
        /* ignore */
      }
      throw new BadRequestException(
        `Xử lý video (watermark burn-in) thất bại: ${e?.message || String(e)}`,
      );
    }
    try {
      unlinkSync(inputPath);
    } catch {
      /* ignore */
    }
    lesson.videoFileKey = outputKey;
    lesson.type = 'video';
    lesson.videoUrl = '';
    await lesson.save();
    return { lessonId: lesson._id.toString(), videoFileKey: outputKey };
  }

  async clearVideoFile(lessonId: string) {
    const lesson = await this.findById(lessonId);
    if (!lesson) throw new NotFoundException('Không tìm thấy bài học');
    if (lesson.videoFileKey) {
      const p = this.getAbsolutePathForKey(lesson.videoFileKey);
      if (existsSync(p)) {
        try {
          unlinkSync(p);
        } catch {
          /* ignore */
        }
      }
    }
    lesson.videoFileKey = '';
    await lesson.save();
    return { ok: true };
  }

  async assertJwtFromRequest(req: Request): Promise<void> {
    const header = req.headers.authorization;
    const fromHeader =
      header?.startsWith('Bearer ') ? header.slice(7).trim() : '';
    const fromQuery =
      typeof req.query.access_token === 'string'
        ? req.query.access_token.trim()
        : '';
    const token = fromHeader || fromQuery;
    if (!token) {
      throw new UnauthorizedException('Thiếu access token');
    }
    try {
      await this.jwtService.verifyAsync(token, {
        secret: this.configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('Token không hợp lệ');
    }
  }

  private mimeForKey(fileKey: string): string {
    const lower = fileKey.toLowerCase();
    if (lower.endsWith('.webm')) return 'video/webm';
    if (lower.endsWith('.mov') || lower.endsWith('.mkv')) return 'video/quicktime';
    return 'video/mp4';
  }

  async streamLessonVideo(
    lessonId: string,
    req: Request,
    res: Response,
  ): Promise<void> {
    try {
      await this.assertJwtFromRequest(req);
    } catch (err: any) {
      const status = err?.status ?? 401;
      res.status(status).json({
        statusCode: status,
        message: err?.response?.message || err?.message || 'Unauthorized',
      });
      return;
    }

    if (!Types.ObjectId.isValid(lessonId)) {
      res.status(400).json({ message: 'lessonId không hợp lệ' });
      return;
    }

    const lesson = await this.lessonModel.findById(lessonId);
    if (!lesson?.videoFileKey) {
      res.status(404).json({ message: 'Video chưa được tải lên' });
      return;
    }

    const path = this.getAbsolutePathForKey(lesson.videoFileKey);
    if (!existsSync(path)) {
      res.status(404).json({ message: 'File video không tồn tại trên máy chủ' });
      return;
    }

    const stat = statSync(path);
    const size = stat.size;
    const range = req.headers.range;
    const mime = this.mimeForKey(lesson.videoFileKey);

    if (range) {
      const match = /^bytes=(\d*)-(\d*)$/.exec(range);
      if (!match) {
        res.status(416).end();
        return;
      }
      let start = match[1] ? parseInt(match[1], 10) : 0;
      let end = match[2] ? parseInt(match[2], 10) : size - 1;
      if (Number.isNaN(start)) start = 0;
      if (Number.isNaN(end) || end >= size) end = size - 1;
      if (start >= size || start > end) {
        res.status(416).end();
        return;
      }
      const chunk = end - start + 1;
      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${size}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunk,
        'Content-Type': mime,
      });
      createReadStream(path, { start, end }).pipe(res);
    } else {
      res.writeHead(200, {
        'Accept-Ranges': 'bytes',
        'Content-Length': size,
        'Content-Type': mime,
      });
      createReadStream(path).pipe(res);
    }
  }

  validateUploadedExtension(originalname: string): string {
    const lower = originalname.toLowerCase();
    const dot = lower.lastIndexOf('.');
    const ext = dot >= 0 ? lower.slice(dot) : '';
    if (!ALLOWED_VIDEO_EXT.has(ext)) {
      throw new BadRequestException(
        `Định dạng không được hỗ trợ. Chỉ chấp nhận: ${[...ALLOWED_VIDEO_EXT].join(', ')}`,
      );
    }
    return ext;
  }

  async importOutline(dto: ImportOutlineDto) {
    const course = await this.courseModel.findById(dto.courseId);
    if (!course) throw new NotFoundException('Không tìm thấy khóa học');

    const moduleCache = new Map<string, Types.ObjectId>();
    let maxModuleOrder = await this.courseModuleModel
      .find({ courseId: course._id })
      .sort({ order: -1 })
      .limit(1)
      .lean()
      .then((rows) => rows[0]?.order ?? 0);

    const resolveModuleId = async (title: string) => {
      const key = title.trim().toLowerCase();
      if (moduleCache.has(key)) return moduleCache.get(key)!;

      let mod = await this.courseModuleModel.findOne({
        courseId: course._id,
        title: title.trim(),
      });
      if (!mod) {
        maxModuleOrder += 1;
        mod = await this.courseModuleModel.create({
          courseId: course._id,
          title: title.trim(),
          order: maxModuleOrder,
        });
      }
      moduleCache.set(key, mod._id as Types.ObjectId);
      return mod._id as Types.ObjectId;
    };

    const created: string[] = [];
    for (const row of dto.rows) {
      const moduleId = await resolveModuleId(row.moduleTitle);
      const doc = await this.lessonModel.create({
        courseId: course._id,
        moduleId,
        title: row.lessonTitle.trim(),
        type: row.type,
        order: row.order,
        duration: row.duration ?? 0,
        summary: row.summary ?? '',
        content: row.content ?? '',
        videoUrl: '',
        videoFileKey: '',
        resourceUrl: '',
        thumbnail: '',
        isPreview: false,
      });
      created.push(doc._id.toString());
    }

    return { createdCount: created.length, lessonIds: created };
  }
}
