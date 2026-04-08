import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ResendWebhookDto } from './dto/payment-mail.dto';
import { PaymentMail, PaymentMailDocument } from './schemas/payment-mail.schema';

type PaymentMailSource = {
    orderCode?: number;
    orderId: string;
    amount: number;
    userEmail?: string;
};

@Injectable()
export class PaymentMailService {
    constructor(
        @InjectModel(PaymentMail.name)
        private readonly paymentMailModel: Model<PaymentMailDocument>,
    ) {}

    async sendSuccessEmailFromPayment(payload: PaymentMailSource) {
        if (!payload.orderCode || !payload.userEmail) {
            return null;
        }

        const subject = '[Xac nhan] Kich hoat khoa hoc thanh cong';

        const log = await this.paymentMailModel.findOneAndUpdate(
            { orderCode: payload.orderCode },
            {
                $set: {
                    orderId: payload.orderId,
                    amount: payload.amount,
                    userEmail: payload.userEmail,
                    subject,
                    status: 'pending',
                },
            },
            { upsert: true, returnDocument: 'after' },
        );

        const apiKey = process.env.RESEND_API_KEY;
        const fromEmail = this.resolveFromEmail();
        const appCourseUrl = process.env.APP_COURSE_URL || 'https://chidung7271.id.vn';

        if (!apiKey || !fromEmail) {
            console.warn('[PaymentMail] Missing RESEND_API_KEY or RESEND_FROM_EMAIL; skipping email send');
            return log;
        }

        const html = this.buildSuccessEmailHtml({
            orderId: payload.orderId,
            amount: payload.amount,
            appCourseUrl,
        });

        try {
            const response = await fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    from: fromEmail,
                    to: [payload.userEmail],
                    subject,
                    html,
                    tags: [
                        { name: 'orderCode', value: String(payload.orderCode) },
                        { name: 'module', value: 'payment-success' },
                    ],
                    metadata: {
                        orderCode: String(payload.orderCode),
                    },
                }),
            });

            const responseText = await response.text();
            let result: { id?: string } = {};

            if (responseText) {
                try {
                    result = JSON.parse(responseText) as { id?: string };
                } catch {
                    result = {};
                }
            }

            if (!response.ok) {
                console.error('[PaymentMail] Resend send failed', { status: response.status, errorText: responseText });
                await this.paymentMailModel.updateOne(
                    { orderCode: payload.orderCode },
                    {
                        $set: {
                            status: 'failed',
                            resendLastEvent: 'send_failed',
                            eventAt: new Date(),
                        },
                    },
                );
                return log;
            }

            const updatedLog = await this.paymentMailModel.findOneAndUpdate(
                { orderCode: payload.orderCode },
                {
                    $set: {
                        status: 'sent',
                        resendEmailId: result.id,
                        sentAt: new Date(),
                        resendLastEvent: 'sent',
                        eventAt: new Date(),
                    },
                },
                { returnDocument: 'after' },
            );

            return updatedLog || log;
        } catch (error) {
            console.error('[PaymentMail] Failed to send success email', error);
            await this.paymentMailModel.updateOne(
                { orderCode: payload.orderCode },
                {
                    $set: {
                        status: 'failed',
                        resendLastEvent: 'send_failed',
                        eventAt: new Date(),
                    },
                },
            );
            return log;
        }
    }

    async handleResendWebhook(payload: ResendWebhookDto) {
        const eventType = (payload.type || payload.data?.type || '').toLowerCase();
        const emailId = payload.data?.email_id;
        const orderCode = this.extractOrderCode(payload);

        const query = emailId
            ? { resendEmailId: emailId }
            : orderCode
                ? { orderCode }
                : null;

        if (!query) {
            throw new BadRequestException('Missing resend email id or orderCode in webhook payload');
        }

        const emailStatus = this.mapResendEventToEmailStatus(eventType);

        const doc = await this.paymentMailModel.findOneAndUpdate(
            query,
            {
                $set: {
                    resendLastEvent: eventType || 'unknown',
                    eventAt: new Date(),
                    ...(emailStatus ? { status: emailStatus } : {}),
                },
            },
            { returnDocument: 'after' },
        );

        if (!doc) {
            throw new BadRequestException('Payment mail log not found for resend webhook payload');
        }

        return {
            message: 'Resend webhook processed successfully',
            orderCode: doc.orderCode,
            emailStatus: doc.status,
        };
    }

    async getMailLogs(status?: string) {
        const query: Record<string, unknown> = {};
        if (status && status !== 'all') {
            query.status = status.toLowerCase();
        }

        const docs = await this.paymentMailModel.find(query).sort({ createdAt: -1 }).lean();

        return docs.map((doc) => ({
            id: String(doc._id),
            orderCode: doc.orderCode,
            orderId: doc.orderId,
            userEmail: doc.userEmail,
            subject: doc.subject,
            status: doc.status,
            resendEmailId: doc.resendEmailId,
            resendLastEvent: doc.resendLastEvent,
            sentAt: doc.sentAt,
            eventAt: doc.eventAt,
            createdAt: (doc as unknown as { createdAt?: Date }).createdAt,
        }));
    }

    private extractOrderCode(payload: ResendWebhookDto) {
        const metadataOrderCode = payload.data?.metadata?.orderCode;
        if (metadataOrderCode) {
            const num = Number(metadataOrderCode);
            if (Number.isFinite(num)) return num;
        }

        const tags = payload.data?.tags;
        if (Array.isArray(tags)) {
            const tag = tags.find((item) => item?.name === 'orderCode');
            if (tag?.value) {
                const num = Number(tag.value);
                if (Number.isFinite(num)) return num;
            }
        }

        if (tags && typeof tags === 'object' && !Array.isArray(tags)) {
            const tagValue = (tags as Record<string, unknown>).orderCode;
            if (tagValue !== undefined && tagValue !== null) {
                const num = Number(tagValue);
                if (Number.isFinite(num)) return num;
            }
        }

        return undefined;
    }

    private mapResendEventToEmailStatus(eventType: string) {
        if (!eventType) return undefined;
        if (eventType.includes('opened')) return 'opened';
        if (eventType.includes('clicked')) return 'clicked';
        if (eventType.includes('delivered')) return 'delivered';
        if (eventType.includes('bounced')) return 'bounced';
        if (eventType.includes('failed')) return 'failed';
        if (eventType.includes('sent')) return 'sent';
        return undefined;
    }

    private resolveFromEmail() {
        return process.env.RESEND_FROM_EMAIL?.trim() || null;
    }

    private buildSuccessEmailHtml(params: { orderId: string; amount: number; appCourseUrl: string }) {
        return `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <style>
        body { font-family: Helvetica, Arial, sans-serif; background-color: #f4f7f9; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
        .header { background: linear-gradient(135deg, #6e8efb, #a777e3); padding: 40px 20px; text-align: center; color: white; }
        .header h1 { margin: 0; font-size: 24px; font-weight: 700; }
        .content { padding: 30px; color: #4a5568; line-height: 1.6; }
        .order-card { background: #f8fafc; border: 1px solid #edf2f7; border-radius: 8px; padding: 20px; margin: 20px 0; }
        .order-row { display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 14px; }
        .label { color: #718096; }
        .value { color: #2d3748; font-weight: 600; text-align: right; }
        .button { display: block; text-align: center; background: #6e8efb; color: #ffffff !important; padding: 14px 25px; text-decoration: none; border-radius: 8px; font-weight: 600; margin-top: 25px; }
        .footer { padding: 20px; text-align: center; font-size: 12px; color: #a0aec0; background: #fdfdfd; border-top: 1px solid #edf2f7; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>KICH HOAT THANH CONG</h1>
        </div>
        <div class="content">
            <p>Xin chao,</p>
            <p>Thanh toan cua ban da duoc xac nhan. Khoa hoc da san sang de bat dau.</p>
            <div class="order-card">
                <div class="order-row">
                    <span class="label">Ma don hang:</span>
                    <span class="value">#${params.orderId}</span>
                </div>
                <div class="order-row">
                    <span class="label">So tien da tra:</span>
                    <span class="value">${params.amount.toLocaleString('vi-VN')} VND</span>
                </div>
            </div>
            <a href="${params.appCourseUrl}" class="button">Bat dau hoc ngay</a>
        </div>
        <div class="footer">
            <p>&copy; 2026 DCD Automation. All rights reserved.</p>
        </div>
    </div>
</body>
</html>`;
    }
}
