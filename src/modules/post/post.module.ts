import { Module } from '@nestjs/common';
import { PostService } from './post.service';
import { PostController } from './post.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Post, PostSchema } from './schemas/post.schemas';
import { SlugCounterModule } from '../slug-counter/slug-counter.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Post.name, schema: PostSchema }]),
    SlugCounterModule,
  ],
  controllers: [PostController],
  providers: [PostService],
})
export class PostModule {}
