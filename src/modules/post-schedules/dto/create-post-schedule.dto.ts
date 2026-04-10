import {
  IsDate,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
} from 'class-validator';
import { StatusSchedulePost } from '../schemas/post-schedule.schema';

export class CreatePostScheduleDto {
  @IsOptional()
  @IsMongoId()
  categoryId: string;

  @IsNotEmpty()
  @IsDate()
  scheduleAt: Date;

  @IsNotEmpty()
  keywords: string;

  @IsNotEmpty()
  campain_description: string;

  @IsNotEmpty()
  writing_tone: string;

  @IsNotEmpty()
  target_audience: string;

  @IsNotEmpty()
  industry: string;

  @IsNotEmpty()
  @IsEnum(StatusSchedulePost)
  status: StatusSchedulePost;

  @IsNotEmpty()
  postId: string;
}
