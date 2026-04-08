import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { createHmac } from 'crypto';
import { Model, Types } from 'mongoose';
import { PaymentMailService } from '../payment-mail/payment-mail.service';
import { CreatePayosPaymentDto, PayosWebhookDto } from './dto/payment.dto';
import { Payment, PaymentDocument } from './schemas/payment.schema';

type PayosApiResponse = {
    code?: string;
    desc?: string;
    data?: {
        bin?: string;
        accountNumber?: string;
        accountName?: string;
        amount?: number;
        description?: string;
        orderCode?: number;
        currency?: string;
        paymentLinkId?: string;
        status?: string;
        checkoutUrl?: string;
        qrCode?: string;
    };
    signature?: string;
};

@Injectable()
export class PaymentService {
    private readonly payosUrl = 'https://api-merchant.payos.vn/v2/payment-requests';

    constructor(
        @InjectModel(Payment.name)
        private readonly paymentModel: Model<PaymentDocument>,
        private readonly paymentMailService: PaymentMailService,
    ) {}

    async createPayosPayment(payload: CreatePayosPaymentDto) {
        const clientId = process.env.PAYOS_CLIENT_ID;
        const apiKey = process.env.PAYOS_API_KEY;
        const checksumKey = process.env.PAYOS_CHECKSUM_KEY;
        const returnUrl = process.env.PAYOS_RETURN_URL || 'https://chidung7271.id.vn/success';
        const cancelUrl = process.env.PAYOS_CANCEL_URL || 'https://chidung7271.id.vn/cancel';

        if (!clientId || !apiKey || !checksumKey) {
            throw new InternalServerErrorException('PayOS environment variables are not configured');
        }

        const amount = Math.max(1, Math.round(payload.amount));
        const orderCode = Date.now();
        const description = this.buildDescription(payload.description || `Thanh toan ${payload.courseTitle}`);
        const dataToSign = `amount=${amount}&cancelUrl=${cancelUrl}&description=${description}&orderCode=${orderCode}&returnUrl=${returnUrl}`;
        const signature = createHmac('sha256', checksumKey).update(dataToSign).digest('hex');

        const response = await fetch(this.payosUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-client-id': clientId,
                'x-api-key': apiKey,
            },
            body: JSON.stringify({
                amount,
                description,
                orderCode,
                signature,
                cancelUrl,
                returnUrl,
            }),
        });

        const result = (await response.json()) as PayosApiResponse;

        if (!response.ok || result.code !== '00' || !result.data) {
            throw new BadRequestException(result.desc || 'Failed to create PayOS payment request');
        }

        await this.paymentModel.create({
            orderId: String(orderCode),
            orderCode,
            amount,
            status: 'pending',
            description,
            userEmail: payload.userEmail,
            userId: this.toObjectId(payload.userId),
            courseId: this.toObjectId(payload.courseId),
            paymentLinkId: result.data.paymentLinkId,
            checkoutUrl: result.data.checkoutUrl,
            payosStatus: result.data.status,
        });

        return {
            ...result.data,
            orderCode,
            amount,
            description,
            signature: result.signature,
        };
    }

    async handlePayosWebhook(payload: PayosWebhookDto) {
        const orderCode = Number(payload?.data?.orderCode);
        if (!Number.isFinite(orderCode)) {
            return {
                acknowledged: true,
                processed: false,
                message: 'Webhook received but orderCode is missing/invalid',
            };
        }

        const payment = await this.paymentModel.findOne({ orderCode });
        if (!payment) {
            return {
                acknowledged: true,
                processed: false,
                orderCode,
                message: 'Webhook received but payment not found',
            };
        }

        const webhookStatus = (payload.data?.status || '').toUpperCase();
        const code = (payload.code || '').toUpperCase();

        let mappedStatus: 'pending' | 'completed' | 'failed' | 'cancelled' = 'pending';

        if (webhookStatus.includes('PAID') || code === '00') {
            mappedStatus = 'completed';
        } else if (webhookStatus.includes('CANCEL')) {
            mappedStatus = 'cancelled';
        } else if (webhookStatus.includes('FAIL') || code === '01' || code === '02') {
            mappedStatus = 'failed';
        }

        payment.status = mappedStatus;
        payment.payosStatus = payload.data?.status || payload.desc;
        payment.paymentLinkId = payload.data?.paymentLinkId || payment.paymentLinkId;
        payment.checkoutUrl = payload.data?.checkoutUrl || payment.checkoutUrl;

        if (mappedStatus === 'completed') {
            payment.payDate = new Date();
        }

        await payment.save();

        if (mappedStatus === 'completed') {
            await this.paymentMailService.sendSuccessEmailFromPayment({
                orderCode: payment.orderCode,
                orderId: payment.orderId,
                amount: payment.amount,
                userEmail: payment.userEmail,
            });
        }

        return {
            acknowledged: true,
            processed: true,
            message: 'Webhook processed successfully',
            orderCode,
            status: payment.status,
        };
    }
    async getPayments(status?: string) {
        const query: Record<string, unknown> = {};

        if (status && status !== 'all') {
            query.status = status.toLowerCase();
        }

        const payments = await this.paymentModel
            .find(query)
            .sort({ createdAt: -1 })
            .lean();

        return payments.map((payment) => {
            const createdAt = (payment as unknown as { createdAt?: Date }).createdAt;

            return {
            id: String(payment._id),
            orderId: payment.orderId,
            orderCode: payment.orderCode,
            amount: payment.amount,
            status: payment.status,
            description: payment.description,
            userEmail: payment.userEmail,
            payDate: payment.payDate,
            createdAt,
        };
        });
    }

    private buildDescription(description: string) {
        return description
            .replace(/\s+/g, ' ')
            .trim()
            .slice(0, 25);
    }

    private toObjectId(value?: string) {
        if (!value || !Types.ObjectId.isValid(value)) {
            return undefined;
        }
        return new Types.ObjectId(value);
    }
}