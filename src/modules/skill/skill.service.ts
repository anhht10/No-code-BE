import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import slugify from 'slugify';
import { CreateSkillDto } from './dto/create-skill.dto';
import { UpdateSkillDto } from './dto/update-skill.dto';
import { Skill, SkillDocument } from './schemas/skill.schema';
import { SlugCounterService } from '../slug-counter/slug-counter.service';

type SkillRecord = {
  id: string;
  name: string;
  slug: string;
  createdAt?: Date;
  updatedAt?: Date;
};

type SkillWithTimestamps = SkillDocument & {
  createdAt?: Date;
  updatedAt?: Date;
};

@Injectable()
export class SkillService {
  constructor(
    @InjectModel(Skill.name)
    private readonly skillModel: Model<SkillDocument>,
     private slugCounterService: SlugCounterService,
  ) {}

  async createSkill(payload: CreateSkillDto) {
    const slug = await this.slugCounterService.generateSlug(
      'skill',
      payload.name ?? '123',
    );
    const post = await this.skillModel.create({ ...payload , slug });
    return {
      _id: post?._id,
    };
  }

  async getSkills(): Promise<SkillRecord[]> {
    const skills = await this.skillModel.find().sort({ createdAt: -1 }).exec();
    return skills.map((skill) => this.toSkillRecord(skill));
  }

  async getSkillById(id: string): Promise<SkillRecord> {
    const objectId = this.parseObjectId(id);
    const skill = await this.skillModel.findById(objectId).exec();

    if (!skill) {
      throw new NotFoundException('Không tìm thấy kỹ năng');
    }

    return this.toSkillRecord(skill);
  }

  async updateSkill(id: string, payload: UpdateSkillDto): Promise<SkillRecord> {
    const objectId = this.parseObjectId(id);
    const existing = await this.skillModel.findById(objectId).exec();

    if (!existing) {
      throw new NotFoundException('Không tìm thấy kỹ năng');
    }

    if (payload.name !== undefined) {
      existing.name = payload.name.trim();
    }

    if (payload.slug !== undefined || payload.name !== undefined) {
      existing.slug = await this.resolveUniqueSlug(
        existing.name,
        payload.slug,
        existing._id.toString(),
      );
    }

    try {
      await existing.save();
      return this.toSkillRecord(existing);
    } catch (error: any) {
      this.throwConflictIfDuplicate(error);
      throw error;
    }
  }

  async deleteSkill(id: string) {
    const objectId = this.parseObjectId(id);
    const deleted = await this.skillModel.findByIdAndDelete(objectId).exec();

    if (!deleted) {
      throw new NotFoundException('Không tìm thấy kỹ năng');
    }

    return {
      id: deleted._id.toString(),
    };
  }

  private toSkillRecord(skill: SkillDocument): SkillRecord {
    const skillWithTimestamps = skill as SkillWithTimestamps;

    return {
      id: skill._id.toString(),
      name: skill.name,
      slug: skill.slug,
      createdAt: skillWithTimestamps.createdAt,
      updatedAt: skillWithTimestamps.updatedAt,
    };
  }

  private parseObjectId(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('ID không hợp lệ');
    }

    return new Types.ObjectId(id);
  }

  private async resolveUniqueSlug(
    name: string,
    providedSlug?: string,
    ignoreId?: string,
  ) {
    const base = this.buildSlug(providedSlug || name);

    if (!base) {
      throw new BadRequestException('Slug không hợp lệ');
    }

    let candidate = base;
    let suffix = 1;

    while (true) {
      const existing = await this.skillModel.findOne({ slug: candidate }).exec();

      if (!existing || (ignoreId && existing._id.toString() === ignoreId)) {
        return candidate;
      }

      candidate = `${base}-${suffix}`;
      suffix += 1;
    }
  }

  private buildSlug(value: string) {
    return slugify(value || '', {
      replacement: '-',
      remove: undefined,
      lower: true,
      strict: true,
      locale: 'vi',
      trim: true,
    });
  }

  private throwConflictIfDuplicate(error: any) {
    if (error?.code === 11000) {
      throw new ConflictException('Tên hoặc slug kỹ năng đã tồn tại');
    }
  }
}
