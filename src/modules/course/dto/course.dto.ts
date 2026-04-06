import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CourseDetailParamsDto {
  @ApiProperty({ example: 'nestjs-fundamentals' })
  @IsString()
  slug: string;
}