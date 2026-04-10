import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PostSchedule } from './schemas/post-schedule.schema';
import { CreatePostScheduleDto } from './dto/create-post-schedule.dto';
import { Injectable } from '@nestjs/common';
import { UpdatePostScheduleDto } from './dto/update-post-schedule.dto';

@Injectable()
export class PostSchedulesService {
  constructor(
    @InjectModel(PostSchedule.name)
    private postScheduleModel: Model<PostSchedule>,
  ) {}

  create(createPostScheduleDto: CreatePostScheduleDto) {
    return this.postScheduleModel.create(createPostScheduleDto);
  }

  findAll() {
    return `This action returns all postSchedules`;
  }

  findOne(id: number) {
    return `This action returns a #${id} postSchedule`;
  }

  update(id: number, updatePostScheduleDto: UpdatePostScheduleDto) {
    return `This action updates a #${id} postSchedule`;
  }

  remove(id: number) {
    return `This action removes a #${id} postSchedule`;
  }
}
