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
import { PostSchedulesService } from './post-schedules.service';
import { CreatePostScheduleDto } from './dto/create-post-schedule.dto';
import { UpdatePostScheduleDto } from './dto/update-post-schedule.dto';
import { Public } from '../auth/decorators/public.decorator';

@Controller('post-schedules')
export class PostSchedulesController {
  constructor(private readonly postSchedulesService: PostSchedulesService) {}

  @Post()
  create(@Body() createPostScheduleDto: CreatePostScheduleDto) {
    return this.postSchedulesService.create(createPostScheduleDto);
  }

  @Get()
  @Public()
  findAll(@Query() { limit = 10, page = 1, search = '', ...query }) {
    return this.postSchedulesService.findAll(query, limit, page, search);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.postSchedulesService.findOne(+id);
  }

  @Patch(':id')
  @Public()
  update(
    @Param('id') id: string,
    @Body() updatePostScheduleDto: UpdatePostScheduleDto,
  ) {
    return this.postSchedulesService.update(id, updatePostScheduleDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.postSchedulesService.remove(id);
  }
}
