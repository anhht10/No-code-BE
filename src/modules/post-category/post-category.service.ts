import { Injectable } from '@nestjs/common';
import { CreatePostCategoryDto } from './dto/create-post-category.dto';
import { UpdatePostCategoryDto } from './dto/update-post-category.dto';
import { InjectModel } from '@nestjs/mongoose';
import { PostCategory } from './schemas/post-category.schema';
import { Model } from 'mongoose';
import { SlugCounterService } from '../slug-counter/slug-counter.service';

@Injectable()
export class PostCategoryService {
  constructor(
    @InjectModel(PostCategory.name)
    private postCategoryModel: Model<PostCategory>,
    private slugCounterService: SlugCounterService,
  ) {}
  async create(createPostCategoryDto: CreatePostCategoryDto) {
    const slug = await this.slugCounterService.generateSlug(
      'post-category',
      createPostCategoryDto.title ?? '123',
    );
    const cat = await this.postCategoryModel.create({
      ...createPostCategoryDto,
      slug,
    });
    return cat;
  }

  findAll() {
    return this.postCategoryModel.find().exec();
  }

  findOne(id: number) {
    return `This action returns a #${id} postCategory`;
  }

  update(id: number, updatePostCategoryDto: UpdatePostCategoryDto) {
    return `This action updates a #${id} postCategory`;
  }

  remove(id: number) {
    return `This action removes a #${id} postCategory`;
  }
}