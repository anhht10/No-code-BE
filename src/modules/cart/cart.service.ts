import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Cart, CartDocument } from './schemas/cart.schema';

@Injectable()
export class CartService {
  constructor(@InjectModel(Cart.name) private cartModel: Model<CartDocument>) {}

  async getCartByUser(userId: string) {
    try {
      const objectId = new Types.ObjectId(userId);
      const cart = await this.cartModel.findOne({ userId: objectId }).lean().exec();
      return cart || { userId: objectId, items: [] };
    } catch (error) {
      throw new BadRequestException('User ID không hợp lệ');
    }
  }

  async addItem(userId: string, item: any) {
    try {
      // Validate input
      if (!item.productId || !item.title || item.price === undefined || item.price < 0) {
        throw new BadRequestException('Dữ liệu sản phẩm không hợp lệ (productId, title, price là bắt buộc)');
      }

      const uid = new Types.ObjectId(userId);

      let existing = await this.cartModel.findOne({ userId: uid }).exec();
      
      if (!existing) {
        existing = new this.cartModel({ 
          userId: uid, 
          items: [{ ...item }] 
        });
        return existing.save();
      }

      // Check if product already exists - don't add duplicates
      const idx = existing.items.findIndex((it: any) => String(it.productId) === String(item.productId));
      if (idx >= 0) {
        // Already in cart, just return without adding
        return existing;
      } else {
        existing.items.push({ ...item });
      }
      
      return existing.save();
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw new BadRequestException('Lỗi khi thêm sản phẩm vào giỏ hàng');
    }
  }

  async removeItem(userId: string, productId: string) {
    try {
      const uid = new Types.ObjectId(userId);
      const existing = await this.cartModel.findOne({ userId: uid }).exec();
      
      if (!existing) {
        throw new NotFoundException('Giỏ hàng không tồn tại');
      }

      const initialLength = existing.items.length;
      existing.items = existing.items.filter((it: any) => String(it.productId) !== String(productId));
      
      if (existing.items.length === initialLength) {
        throw new BadRequestException('Sản phẩm không tồn tại trong giỏ hàng');
      }

      return existing.save();
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) throw error;
      throw new BadRequestException('Lỗi khi xoá sản phẩm khỏi giỏ hàng');
    }
  }

  async clearCart(userId: string) {
    try {
      const uid = new Types.ObjectId(userId);
      return this.cartModel
        .findOneAndUpdate(
          { userId: uid },
          { items: [] },
          { new: true }
        )
        .exec();
    } catch (error) {
      throw new BadRequestException('Lỗi khi xoá giỏ hàng');
    }
  }
  async updateItemQuantity(userId: string, productId: string, quantity: number) {
    // Courses don't have quantities - each course is 1 unit
    throw new BadRequestException('Khóa học không hỗ trợ cập nhật số lượng. Vui lòng thêm hoặc xóa khóa học.');
  }}
