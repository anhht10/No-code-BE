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

export class PayosWebhookDataDto {
    @ApiPropertyOptional({ example: 1775580257757 })
    @IsOptional()
    @IsNumber()
    orderCode?: number;

    @ApiPropertyOptional({ example: 'PAID' })
    @IsOptional()
    @IsString()
    status?: string;

    @ApiPropertyOptional({ example: 299000 })
    @IsOptional()
    @IsNumber()
    amount?: number;

    @ApiPropertyOptional({ example: 'Thanh toan khoa hoc NestJS Fundamentals' })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiPropertyOptional({ example: 'abcd1234' })
    @IsOptional()
    @IsString()
    paymentLinkId?: string;

    @ApiPropertyOptional({ example: 'https://pay.payos.vn/web/123' })
    @IsOptional()
    @IsString()
    checkoutUrl?: string;

    @ApiPropertyOptional({ example: '00' })
    @IsOptional()
    @IsString()
    code?: string;

    @ApiPropertyOptional({ example: 'Thành công' })
    @IsOptional()
    @IsString()
    desc?: string;
}

export class PayosWebhookDto {
    @ApiPropertyOptional({ example: '00' })
    @IsOptional()
    @IsString()
    code?: string;

    @ApiPropertyOptional({ example: 'success' })
    @IsOptional()
    @IsString()
    desc?: string;

    @ApiPropertyOptional({ type: PayosWebhookDataDto })
    @IsOptional()
    data?: PayosWebhookDataDto;

    @ApiPropertyOptional({ example: '77a49c48124234facfeff2e5d6020c25fe8d869010c18459b65b56b00ab0fd09' })
    @IsOptional()
    @IsString()
    signature?: string;
}