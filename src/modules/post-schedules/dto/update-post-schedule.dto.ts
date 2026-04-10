import { IsDate, IsEnum, IsMongoId, IsOptional } from 'class-validator';
import { StatusSchedulePost } from '../schemas/post-schedule.schema';

export class UpdatePostScheduleDto {
  @IsOptional()
  @IsMongoId()
  categoryId: string;

  @IsOptional()
  @IsDate()
  scheduleAt: Date;

  @IsOptional()
  keywords: string;

  @IsOptional()
  campain_description: string;

  @IsOptional()
  writing_tone: string;

  @IsOptional()
  target_audience: string;

  @IsOptional()
  industry: string;

  @IsOptional()
  @IsEnum(StatusSchedulePost)
  status: StatusSchedulePost;

  @IsOptional()
  postId: string;
}
