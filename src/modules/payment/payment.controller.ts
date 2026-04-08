import { Body, Controller, Get, HttpCode, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Public } from '../auth/decorators/public.decorator';
import { CreatePayosPaymentDto, PayosWebhookDto } from './dto/payment.dto';
import { PaymentService } from './payment.service';

@ApiTags('Payments')
@ApiBearerAuth()
@Controller('payments')
export class PaymentController {
    constructor(private readonly paymentService: PaymentService) {}

    @Post('payos')
    @ApiOperation({ summary: 'Create a PayOS payment request for a course' })
    createPayosPayment(@Body() body: CreatePayosPaymentDto) {
        return this.paymentService.createPayosPayment(body);
    }

    @Public()
    @Post('payos/webhook')
    @HttpCode(200)
    @ApiOperation({ summary: 'Receive PayOS webhook and update payment status' })
    handlePayosWebhook(@Body() body: PayosWebhookDto) {
        return this.paymentService.handlePayosWebhook(body);
    }

    @Get()
    @ApiOperation({ summary: 'Get payment list for admin dashboard' })
    @ApiQuery({ name: 'status', required: false, type: String })
    getPayments(@Query('status') status?: string) {
        return this.paymentService.getPayments(status);
    }
}