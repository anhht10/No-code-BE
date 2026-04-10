import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { Public } from '../auth/decorators/public.decorator';
import { ResendWebhookDto } from './dto/payment-mail.dto';
import { PaymentMailService } from './payment-mail.service';

@ApiTags('Payment Mails')
@ApiBearerAuth()
@Controller('payment-mails')
export class PaymentMailController {
  constructor(private readonly paymentMailService: PaymentMailService) {}

  @Public()
  @Post('resend/webhook')
  @ApiOperation({
    summary: 'Receive Resend webhook and update email read/delivery status',
  })
  handleResendWebhook(@Body() body: ResendWebhookDto) {
    return this.paymentMailService.handleResendWebhook(body);
  }

  @Get()
  @ApiOperation({ summary: 'Get payment mail logs for admin dashboard' })
  @ApiQuery({ name: 'status', required: false, type: String })
  getPaymentMails(@Query('status') status?: string) {
    return this.paymentMailService.getMailLogs(status);
  }
}
