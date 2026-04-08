import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type PaymentMailDocument = HydratedDocument<PaymentMail>;

@Schema({
    timestamps: true,
    collection: 'payment_mails',
})
export class PaymentMail {
    @Prop({ type: Number, required: true, index: true })
    orderCode: number;

    @Prop({ type: String, required: true, index: true })
    orderId: string;

    @Prop({ type: String, required: true, index: true })
    userEmail: string;

    @Prop({ type: Number, required: true, min: 0 })
    amount: number;

    @Prop({ type: String })
    subject?: string;

    @Prop({
        type: String,
        enum: ['pending', 'sent', 'delivered', 'opened', 'clicked', 'bounced', 'failed'],
        default: 'pending',
        index: true,
    })
    status: string;

    @Prop({ type: String, index: true })
    resendEmailId?: string;

    @Prop({ type: String })
    resendLastEvent?: string;

    @Prop({ type: Date })
    sentAt?: Date;

    @Prop({ type: Date })
    eventAt?: Date;
}

export const PaymentMailSchema = SchemaFactory.createForClass(PaymentMail);
