import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, Min, MinLength } from 'class-validator';

export class CreatePayosPaymentDto {
    @ApiProperty({ example: '68c1f7d8e1a4c9d2a6b7c8d9' })
    @IsString()
    @MinLength(1)
    courseId: string;

    @ApiPropertyOptional({ example: '67d1a001c1a1a1a1a1a1a101' })
    @IsOptional()
    @IsString()
    userId?: string;

    @ApiProperty({ example: 'NestJS Fundamentals' })
    @IsString()
    @MinLength(1)
    courseTitle: string;

    @ApiProperty({ example: 299000 })
    @IsNumber()
    @Min(1)
    amount: number;

    @ApiPropertyOptional({ example: 'Thanh toan khoa hoc NestJS Fundamentals' })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiPropertyOptional({ example: 'chidung7271@gmail.com' })
    @IsOptional()
    @IsString()
    userEmail?: string;
}