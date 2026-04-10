import { Module } from '@nestjs/common';
import { PostCategoryService } from './post-category.service';
import { PostCategoryController } from './post-category.controller';
import {
  PostCategory,
  PostCategorySchema,
} from './schemas/post-category.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { SlugCounterModule } from '../slug-counter/slug-counter.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PostCategory.name, schema: PostCategorySchema },
    ]),
    SlugCounterModule,
  ],
  controllers: [PostCategoryController],
  providers: [PostCategoryService],
})
export class PostCategoryModule {}