import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PostSchedule } from './schemas/post-schedule.schema';
import { CreatePostScheduleDto } from './dto/create-post-schedule.dto';
import { Injectable } from '@nestjs/common';
import { UpdatePostScheduleDto } from './dto/update-post-schedule.dto';
import aqp from 'api-query-params';

@Injectable()
export class PostSchedulesService {
  constructor(
    @InjectModel(PostSchedule.name)
    private postScheduleModel: Model<PostSchedule>,
  ) {}

  create(createPostScheduleDto: CreatePostScheduleDto) {
    return this.postScheduleModel.create(createPostScheduleDto);
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

    const schedule = await this.postScheduleModel
      .find({
        ...filter,
        $or: [
          { scheduleAt: { $regex: search, $options: 'i' } },
          { industry: { $regex: search, $options: 'i' } },
          { keywords: { $regex: search, $options: 'i' } },
        ],
      })
      .select(projection ?? '-__v')
      .sort(sort as any)
      .limit(limit)
      .skip((page - 1) * limit);

    return schedule;
  }

  findOne(id: number) {
    return `This action returns a #${id} postSchedule`;
  }

  update(id: number, updatePostScheduleDto: UpdatePostScheduleDto) {
    return this.postScheduleModel.updateOne({ _id: id }, updatePostScheduleDto);
  }

  remove(id: number) {
    return `This action removes a #${id} postSchedule`;
  }
}
