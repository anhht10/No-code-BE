import { IsNotEmpty } from 'class-validator';

export class CreatePostCategoryDto {
  @IsNotEmpty()
  title?: string;
}
