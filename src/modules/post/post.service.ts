import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Post } from './schemas/post.schemas';
import aqp from 'api-query-params';
import { SlugCounterService } from '../slug-counter/slug-counter.service';

@Injectable()
export class PostService {
  constructor(
    @InjectModel(Post.name) private postModel: Model<Post>,
    private slugCounterService: SlugCounterService,
  ) {}

  async create(createPostDto: CreatePostDto) {
    const slug = await this.slugCounterService.generateSlug(
      'post',
      createPostDto.slug ?? createPostDto.title ?? '123',
    );
    const post = await this.postModel.findOne({ ...createPostDto, slug });

    return {
      _id: post?._id,
    };
  }

  async findAll(
    query: {
      [key: string]: any;
    },
    limit: number,
    page: number,
    search: string,
  ) {
    const { filter, sort, projection } = aqp(query);

    if (!page || isNaN(page)) {
      page = 1;
    }

    if (!limit || isNaN(limit)) {
      limit = 10;
    }

    const post = await this.postModel
      .find({
        ...filter,
        $or: [
          { title: { $regex: search, $options: 'i' } },
          { content: { $regex: search, $options: 'i' } },
        ],
      })
      .select(projection ?? '-__v')
      .sort(sort as any)
      .limit(limit)
      .skip((page - 1) * limit);

    return post;
  }

  async findOne(slug: string) {
    const post = await this.postModel.findOne({ slug });

    if (!post) {
      throw new NotFoundException(`Post with slug ${slug} not found`);
    }
    return post;
  }

  update(id: number, updatePostDto: UpdatePostDto) {
    updatePostDto.slug = '';
    return `This action updates a #${id} post`;
  }

  remove(id: number) {
    return `This action removes a #${id} post`;
  }
}
