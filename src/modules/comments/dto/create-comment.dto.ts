import { IsMongoId, IsOptional, IsString } from 'class-validator';
import { IsIn } from 'class-validator';

export class CreateCommentDto {
  @IsMongoId()
  postId: string;

  @IsString()
  content: string;

  @IsOptional()
  @IsMongoId()
  parentId?: string;
}

export class ReactCommentDto {
  @IsIn(['like', 'love', 'haha', 'wow', 'sad', 'angry'])
  type: string;
}
