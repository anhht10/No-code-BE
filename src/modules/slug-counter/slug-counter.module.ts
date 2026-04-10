import { Module } from '@nestjs/common';
import { SlugCounterService } from './slug-counter.service';
import { MongooseModule } from '@nestjs/mongoose';
import { SlugCounter, SlugCounterSchema } from './schemas/slug-counter.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: SlugCounter.name,
        schema: SlugCounterSchema,
      },
    ]),
  ],
  providers: [SlugCounterService],
  exports: [SlugCounterService],
})
export class SlugCounterModule {}
