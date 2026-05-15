import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsNumber, IsOptional, IsString, Min, Max, IsPositive } from 'class-validator';
import { Types } from 'mongoose';

export class AddCartItemDto {
  @ApiProperty({ example: '60d0fe4f5311236168a109ca' })
  @IsMongoId({ message: 'Product ID phải là một MongoDB ID hợp lệ' })
  productId: Types.ObjectId;

  @ApiProperty({ example: 'Product title' })
  @IsString({ message: 'Tiêu đề sản phẩm phải là chuỗi ký tự' })
  title: string;

  @ApiProperty({ example: 99.99 })
  @IsNumber({ allowNaN: false }, { message: 'Giá phải là một số hợp lệ' })
  @IsPositive({ message: 'Giá phải lớn hơn 0' })
  price: number;

  @ApiProperty({ example: 1 })
  @IsOptional()
  @IsNumber({}, { message: 'Số lượng phải là một số' })
  @Min(1, { message: 'Số lượng phải tối thiểu là 1' })
  @Max(999, { message: 'Số lượng không được vượt quá 999' })
  quantity?: number;
}

export class UpdateCartItemQuantityDto {
  @ApiProperty({ example: 5 })
  @IsNumber({}, { message: 'Số lượng phải là một số' })
  @Min(1, { message: 'Số lượng phải tối thiểu là 1' })
  @Max(999, { message: 'Số lượng không được vượt quá 999' })
  quantity: number;
}
