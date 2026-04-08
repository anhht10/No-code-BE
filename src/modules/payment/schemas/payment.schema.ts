import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type PaymentDocument = HydratedDocument<Payment>;

@Schema({
    timestamps: true,
    collection: 'payments',
})
export class Payment {
    @Prop({ type: Types.ObjectId, ref: 'User', index: true })
    userId?: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'Course', index: true })
    courseId?: Types.ObjectId;

    @Prop({ type: String, required: true, unique: true })
    orderId: string;

    @Prop({ type: Number, unique: true, index: true })
    orderCode?: number;

    @Prop({ type: Number, required: true, min: 0 })
    amount: number;

    @Prop({
        type: String,
        enum: ['pending', 'completed', 'failed', 'cancelled'],
        default: 'pending',
        index: true,
    })
    status: string;

    @Prop({ type: String })
    description: string;

    @Prop({ type: String, index: true })
    userEmail?: string;

    @Prop({ type: String })
    paymentLinkId?: string;

    @Prop({ type: String })
    checkoutUrl?: string;

    @Prop({ type: String })
    payosStatus?: string;

    @Prop({ type: Date })
    payDate?: Date;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);