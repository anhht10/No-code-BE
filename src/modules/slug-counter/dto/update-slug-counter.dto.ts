import { PartialType } from '@nestjs/swagger';
import { CreateSlugCounterDto } from './create-slug-counter.dto';

export class UpdateSlugCounterDto extends PartialType(CreateSlugCounterDto) {}
