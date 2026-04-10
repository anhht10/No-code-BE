import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { Request } from 'express';
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

  @Get('my-courses')
  @ApiOperation({ summary: 'Get purchased courses for current user' })
  getMyPurchasedCourses(
    @Req() req: Request & { user?: { userId?: string; email?: string } },
    @Query('email') email?: string,
  ) {
    const userId = req.user?.userId;
    const fallbackEmail = email || req.user?.email;
    return this.paymentService.getMyPurchasedCourses(userId, fallbackEmail);
  }
}

