import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsNumberString, IsOptional, IsString, MinLength } from 'class-validator';

export enum TrackingAction {
  VIEW_COURSE = 'view_course',
  ENROLL = 'enroll',
  COMPLETE_LESSON = 'complete_lesson',
}

export class CreateTrackingDto {
  @ApiProperty({ example: '66c3c0c1a7c1f5a8c4d9e111' })
  @IsString()
  @MinLength(1)
  userId: string;

  @ApiProperty({ example: '66c3c0c1a7c1f5a8c4d9e222' })
  @IsString()
  @MinLength(1)
  courseId: string;

  @ApiProperty({ enum: TrackingAction, example: TrackingAction.VIEW_COURSE })
  @IsEnum(TrackingAction)
  action: TrackingAction;

  @ApiProperty({ example: '2026-04-06T12:34:56.000Z', required: false })
  @IsOptional()
  @IsDateString()
  timestamp?: string;
}

export class UpdateTrackingDto extends PartialType(CreateTrackingDto) {}

export class QueryTrackingDto {
  @ApiPropertyOptional({ enum: TrackingAction, example: TrackingAction.VIEW_COURSE })
  @IsOptional()
  @IsEnum(TrackingAction)
  action?: TrackingAction;

  @ApiPropertyOptional({ example: '67d1a001c1a1a1a1a1a1a101' })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiPropertyOptional({ example: '69b11405629665cceb045661' })
  @IsOptional()
  @IsString()
  courseId?: string;

  @ApiPropertyOptional({ example: '1' })
  @IsOptional()
  @IsNumberString()
  page?: string;

  @ApiPropertyOptional({ example: '20' })
  @IsOptional()
  @IsNumberString()
  limit?: string;

  @ApiPropertyOptional({ example: '2026-04-01' })
  @IsOptional()
  @IsDateString()
  fromDate?: string;

  @ApiPropertyOptional({ example: '2026-04-11' })
  @IsOptional()
  @IsDateString()
  toDate?: string;
}