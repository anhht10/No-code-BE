import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type CartDocument = HydratedDocument<Cart>;

class CartItem {
  @Prop({ type: Types.ObjectId })
  productId: Types.ObjectId;

  @Prop({ type: String })
  title: string;

  @Prop({ type: Number })
  price: number;

  @Prop({ type: Number, default: 1 })
  quantity: number;
}

@Schema({
  timestamps: true,
  collection: 'carts',
})
export class Cart {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  @Prop({ type: [Object], default: [] })
  items: CartItem[];
}

export const CartSchema = SchemaFactory.createForClass(Cart);
