import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PostCategory, PostCategorySchema } from './schemas/post-category.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: PostCategory.name, schema: PostCategorySchema }])],
})
export class PostCategoryModule {}
