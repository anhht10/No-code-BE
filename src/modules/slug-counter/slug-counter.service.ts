import { Injectable } from '@nestjs/common';

import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import slugify from 'slugify';
import { SlugCounter } from './schemas/slug-counter.schema';

@Injectable()
export class SlugCounterService {
  constructor(
    @InjectModel(SlugCounter.name) private slugCounterModel: Model<SlugCounter>,
  ) {}

  async generateSlug(table: string, name: string): Promise<string> {
    const slug = slugify(name, {
      replacement: '-',
      remove: undefined,
      lower: true,
      strict: true,
      locale: 'vi',
      trim: true,
    });

    const _id = `${table}:${slug}`;

    const exists = await this.slugCounterModel.findOne({ _id });

    if (exists) {
      const seq = exists.seq + 1;
      exists.seq = seq;
      await exists.save();
      return slugify(`${name}-${seq}`, {
        replacement: '-',
        remove: undefined,
        lower: true,
        strict: true,
        locale: 'vi',
        trim: true,
      });
    }

    await this.slugCounterModel.create({
      _id,
      seq: 1,
    });

    return slug;
  }
}
