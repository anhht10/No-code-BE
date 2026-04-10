import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { PostService } from './post.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { ApiOperation } from '@nestjs/swagger';
import { Public } from '../auth/decorators/public.decorator';

@Controller('post')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Post('ai')
  @Public()
  @ApiOperation({ summary: 'Create a new post' })
  create(@Body() createPostDto: CreatePostDto) {
    return this.postService.create(createPostDto);
  }

  @Get()
  @ApiOperation({ summary: 'Find all posts' })
  findAll(@Query() { limit = 10, page = 1, search = '', ...query }) {
    return this.postService.findAll(query, limit, page, search);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Find a post by ID' })
  findOne(@Param('slug') slug: string) {
    queueMi;
    return this.postService.findOne(slug);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a post by ID' })
  update(@Param('id') id: string, @Body() updatePostDto: UpdatePostDto) {
    return this.postService.update(+id, updatePostDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a post by ID' })
  remove(@Param('id') id: string) {
    return this.postService.remove(+id);
  }
}
