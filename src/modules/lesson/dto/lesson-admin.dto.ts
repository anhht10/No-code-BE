import { Type } from 'class-transformer';
import {
  IsArray,
  IsIn,
  IsMongoId,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

export class ImportOutlineRowDto {
  @IsString()
  @MaxLength(200)
  moduleTitle: string;

  @IsString()
  @MaxLength(200)
  lessonTitle: string;

  @IsString()
  @IsIn(['video', 'article', 'quiz'])
  type: 'video' | 'article' | 'quiz';

  @IsNumber()
  @Min(1)
  order: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  duration?: number;

  @IsOptional()
  @IsString()
  summary?: string;

  @IsOptional()
  @IsString()
  content?: string;
}

export class ImportOutlineDto {
  @IsMongoId()
  courseId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ImportOutlineRowDto)
  rows: ImportOutlineRowDto[];
}
