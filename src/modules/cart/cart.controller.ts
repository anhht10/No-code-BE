import { Body, Controller, Delete, Get, Post, Put, Req, BadRequestException, Param, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags, ApiParam } from '@nestjs/swagger';
import { ResponseMessage } from '../../common/decorators/response-message.decorator';
import { AddCartItemDto, UpdateCartItemQuantityDto } from './dto/cart.dto';
import { CartService } from './cart.service';
import { JwtAuthGuard } from '../auth/gaurds/jwt-auth.guard';

@ApiTags('Cart')
@Controller('cart')
@UseGuards(JwtAuthGuard)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  @ResponseMessage('Lấy giỏ hàng người dùng thành công')
  @ApiOperation({ summary: 'Get current user cart' })
  async getCart(@Req() req: any) {
    const userId = req.user?.userId || req.user?._id || req.user?.id;
    if (!userId) {
      throw new BadRequestException('Không thể lấy thông tin người dùng');
    }
    return this.cartService.getCartByUser(userId);
  }

  @Post()
  @ResponseMessage('Thêm sản phẩm vào giỏ hàng thành công')
  @ApiOperation({ summary: 'Add item to cart' })
  async addToCart(@Req() req: any, @Body() payload: AddCartItemDto) {
    const userId = req.user?.userId || req.user?._id || req.user?.id;
    if (!userId) {
      throw new BadRequestException('Không thể lấy thông tin người dùng');
    }
    return this.cartService.addItem(userId, payload);
  }

  @Delete(':productId')
  @ResponseMessage('Xoá sản phẩm khỏi giỏ hàng thành công')
  @ApiOperation({ summary: 'Remove item from cart' })
  @ApiParam({ name: 'productId', description: 'Product ID to remove' })
  async removeFromCart(@Req() req: any, @Param('productId') productId: string) {
    const userId = req.user?.userId || req.user?._id || req.user?.id;
    if (!userId) {
      throw new BadRequestException('Không thể lấy thông tin người dùng');
    }
    if (!productId) {
      throw new BadRequestException('Product ID là bắt buộc');
    }
    return this.cartService.removeItem(userId, productId);
  }
  @Put(':productId')
  @ResponseMessage('Cập nhật số lượng sản phẩm thành công')
  @ApiOperation({ summary: 'Update item quantity in cart' })
  @ApiParam({ name: 'productId', description: 'Product ID to update' })
  async updateItemQuantity(
    @Req() req: any,
    @Param('productId') productId: string,
    @Body() payload: UpdateCartItemQuantityDto,
  ) {
    const userId = req.user?.userId || req.user?._id || req.user?.id;
    if (!userId) {
      throw new BadRequestException('Không thể lấy thông tin người dùng');
    }
    if (!productId) {
      throw new BadRequestException('Product ID là bắt buộc');
    }
    return this.cartService.updateItemQuantity(userId, productId, payload.quantity);
  }
}
