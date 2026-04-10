import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { PostSchedulesService } from './post-schedules.service';
import { CreatePostScheduleDto } from './dto/create-post-schedule.dto';
import { UpdatePostScheduleDto } from './dto/update-post-schedule.dto';

@Controller('post-schedules')
export class PostSchedulesController {
  constructor(private readonly postSchedulesService: PostSchedulesService) {}

  @Post()
  create(@Body() createPostScheduleDto: CreatePostScheduleDto) {
    return this.postSchedulesService.create(createPostScheduleDto);
  }

  @Get()
  findAll() {
    return this.postSchedulesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.postSchedulesService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updatePostScheduleDto: UpdatePostScheduleDto,
  ) {
    return this.postSchedulesService.update(+id, updatePostScheduleDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.postSchedulesService.remove(+id);
  }
}
