import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Industry, IndustrySchema, IndustryDocument } from './schemas/industry.schema';
type IndustriesRecord = Record<string, any>;

@Injectable()
export class IndustryService {
    constructor(
        @InjectModel(Industry.name)
        private readonly courseModel: Model<IndustryDocument>,
    ) { }

    async getIndustries(): Promise<IndustriesRecord[]> {
        const industries = await this.courseModel.find().exec();
        return industries.map((industry) => ({
            id: industry._id,
            name: industry.name,
            slug: industry.slug,
        }));
    }
}