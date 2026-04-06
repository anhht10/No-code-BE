import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateTrackingDto } from './dto/tracking.dto';
import { UserLog, UserLogDocument } from './schemas/user_log.schema';

@Injectable()
export class TrackingService {
    constructor(
        @InjectModel(UserLog.name)
        private readonly userLogModel: Model<UserLogDocument>,
    ) { }

        async createTracking(payload: CreateTrackingDto) {
        return this.userLogModel.create({
            userId: payload.userId,
            courseId: payload.courseId,
            action: payload.action,
            timestamp: payload.timestamp ? new Date(payload.timestamp) : new Date(),
        });
    }
}