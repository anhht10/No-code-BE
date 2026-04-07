import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { User } from '../../user/schemas/user.schema';

@Schema({ timestamps: true })
export class RefreshToken{
  @Prop({ type: Types.ObjectId, ref: User.name, required: true })
  userId: Types.ObjectId;

  @Prop({ required: true, unique: true, index: true })
  token: string;

  @Prop()
  ipAddress: string;

  @Prop()
  deviceInfo: string;

  @Prop({ type: Date, expires: 0 , required: true }) // TTL index, tự động xóa khi đến expiresAt
  expiresAt: Date;

  @Prop({ default: false })
  deleted: boolean;
}

export const RefreshTokenSchema = SchemaFactory.createForClass(RefreshToken);
export type RefreshTokenDocument = HydratedDocument<RefreshToken>;