import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsMongoId, IsNumber, IsOptional, IsString } from 'class-validator';
import { Types } from 'mongoose';

export class CourseDetailParamsDto {
  @ApiProperty({ example: 'nestjs-fundamentals' })
  @IsString()
  slug: string;
}

export class CreateCourseDto {
  @ApiProperty({ example: 'NestJS Fundamentals' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'NestJS Fundamentals' })
  @IsString()
  slug: string;

  @ApiProperty({ example: 'Learn the basics of NestJS' })
  @IsString()
  description: string;

  @ApiProperty({ example: 99.99 })
  @Type(() => Number)
  @IsNumber({}, { message: 'Price must be a valid number' })
  price?: number;

  @ApiProperty({ example: 120 })
  @Type(() => Number)
  @IsNumber({}, { message: 'Duration must be a valid number' })
  duration: number;

  @ApiProperty({ example: 'beginner' })
  @IsString()
  level?: string;

  @ApiProperty({ example: 'https://example.com/image.png' })
  @IsOptional()
  @IsString()
  image?: string;

  @ApiProperty({ example: '60d0fe4f5311236168a109ca' })
  @IsMongoId({ message: 'industryId must be a valid MongoDB ObjectId' })
  industryId: Types.ObjectId;
}

