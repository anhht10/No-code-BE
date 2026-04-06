import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsString, MinLength } from 'class-validator';

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
  @IsDateString()
  timestamp?: string;
}