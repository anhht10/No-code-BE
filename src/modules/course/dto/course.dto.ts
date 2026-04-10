import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { Types } from 'mongoose';

export class CourseDetailParamsDto {
  @ApiProperty({ example: 'nestjs-fundamentals' })
  @IsString()
  slug: string;
}

export class CreateCourseDto {
  @ApiProperty({ example: 'NestJS Fundamentals' })
  @IsString()
  slug: string;

  @ApiProperty({ example: 'Learn the basics of NestJS' })
  @IsString()
  description: string;

  @ApiProperty({ example: 99.99 })
  price?: number;
  @ApiProperty({ example: 120 })
  duration?: number;
  @ApiProperty({ example: 'beginner' })
  level?: string;
  @ApiProperty({ example: 'https://example.com/image.png' })
  image?: string;
  @ApiProperty({ example: '60d0fe4f5311236168a109ca' })
  industryId: Types.ObjectId;
}

