import { IsMongoId, IsNotEmpty, IsOptional } from 'class-validator';

export class CreatePostDto {
  @IsNotEmpty()
  title?: string;

  @IsOptional()
  slug?: string;

  @IsOptional()
  content?: string;

  @IsOptional()
  excerpt?: string;

  @IsOptional()
  thumbnail?: string;

  @IsOptional()
  status?: string;

  @IsOptional()
  @IsMongoId()
  categoryId?: string;
}
