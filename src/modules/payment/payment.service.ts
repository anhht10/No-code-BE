import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { createHmac } from 'crypto';
import { Model, Types } from 'mongoose';
import { CreatePayosPaymentDto } from './dto/payment.dto';
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
            amount,
            status: 'pending',
            description,
            userId: this.toObjectId(payload.userId, 'userId'),
            courseId: this.toObjectId(payload.courseId, 'courseId'),
        });

        return {
            ...result.data,
            orderCode,
            amount,
            description,
            signature: result.signature,
        };
    }

    private buildDescription(description: string) {
        return description
            .replace(/\s+/g, ' ')
            .trim()
            .slice(0, 25);
    }

    private toObjectId(value: string | undefined, fieldName: string) {
        if (!value || !Types.ObjectId.isValid(value)) {
            throw new BadRequestException(`${fieldName} is invalid`);
        }
        return new Types.ObjectId(value);
    }
}