import { Body, Controller, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreatePayosPaymentDto } from './dto/payment.dto';
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
}