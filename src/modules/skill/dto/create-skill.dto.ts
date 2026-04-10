import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateSkillDto {
  @ApiProperty({ example: 'Problem Solving' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiProperty({
    example: 'problem-solving',
    required: false,
    description: 'Optional. If omitted, backend generates from name.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  slug?: string;
}
