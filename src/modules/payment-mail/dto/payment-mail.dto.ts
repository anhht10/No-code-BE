import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class ResendWebhookDataDto {
    @ApiPropertyOptional({ example: 'email.opened' })
    @IsOptional()
    @IsString()
    type?: string;

    @ApiPropertyOptional({ example: '1f7e9db5-8bd5-4f7b-81da-1dc5dd84bc4e' })
    @IsOptional()
    @IsString()
    email_id?: string;

    @ApiPropertyOptional({ example: [{ name: 'orderCode', value: '1775580257757' }] })
    @IsOptional()
    tags?: Array<{ name?: string; value?: string }>;

    @ApiPropertyOptional({ example: { orderCode: '1775580257757' } })
    @IsOptional()
    metadata?: Record<string, unknown>;
}

export class ResendWebhookDto {
    @ApiPropertyOptional({ example: 'email.delivered' })
    @IsOptional()
    @IsString()
    type?: string;

    @ApiPropertyOptional({ type: ResendWebhookDataDto })
    @IsOptional()
    data?: ResendWebhookDataDto;
}
