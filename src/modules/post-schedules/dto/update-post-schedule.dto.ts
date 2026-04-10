import { PartialType } from '@nestjs/swagger';
import { CreatePostScheduleDto } from './create-post-schedule.dto';

export class UpdatePostScheduleDto extends PartialType(CreatePostScheduleDto) {}
