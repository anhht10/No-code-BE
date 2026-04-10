import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateTrackingDto, QueryTrackingDto, UpdateTrackingDto } from './dto/tracking.dto';
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

    async getTrackingLogs(query: QueryTrackingDto) {
        const page = Math.max(1, Number(query.page || 1));
        const limit = Math.min(100, Math.max(1, Number(query.limit || 20)));
        const skip = (page - 1) * limit;

        const match: Record<string, unknown> = {};
        if (query.action) {
            match.action = query.action;
        }
        if (query.userId && Types.ObjectId.isValid(query.userId)) {
            match.userId = new Types.ObjectId(query.userId);
        }
        if (query.courseId && Types.ObjectId.isValid(query.courseId)) {
            match.courseId = new Types.ObjectId(query.courseId);
        }
        if (query.fromDate || query.toDate) {
            const dateMatch: Record<string, Date> = {};

            if (query.fromDate) {
                const from = new Date(query.fromDate);
                from.setHours(0, 0, 0, 0);
                dateMatch.$gte = from;
            }

            if (query.toDate) {
                const to = new Date(query.toDate);
                to.setHours(23, 59, 59, 999);
                dateMatch.$lte = to;
            }

            match.timestamp = dateMatch;
        }

        const [items, total, grouped] = await Promise.all([
            this.userLogModel.aggregate([
                { $match: match },
                { $sort: { timestamp: -1, _id: -1 } },
                { $skip: skip },
                { $limit: limit },
                {
                    $lookup: {
                        from: 'users',
                        localField: 'userId',
                        foreignField: '_id',
                        as: 'userInfo',
                    },
                },
                {
                    $lookup: {
                        from: 'courses',
                        localField: 'courseId',
                        foreignField: '_id',
                        as: 'courseInfo',
                    },
                },
                {
                    $project: {
                        id: { $toString: '$_id' },
                        userId: { $toString: '$userId' },
                        courseId: { $toString: '$courseId' },
                        action: '$action',
                        timestamp: '$timestamp',
                        userName: {
                            $ifNull: [
                                { $arrayElemAt: ['$userInfo.name', 0] },
                                { $arrayElemAt: ['$userInfo.email', 0] },
                            ],
                        },
                        courseTitle: { $arrayElemAt: ['$courseInfo.title', 0] },
                    },
                },
            ]),
            this.userLogModel.countDocuments(match),
            this.userLogModel.aggregate([
                { $match: match },
                {
                    $group: {
                        _id: '$action',
                        count: { $sum: 1 },
                    },
                },
            ]),
        ]);

        const actionCounts = {
            view_course: 0,
            enroll: 0,
            complete_lesson: 0,
        };

        grouped.forEach((item: { _id?: string; count?: number }) => {
            if (!item?._id || typeof item.count !== 'number') return;
            if (item._id === 'view_course') actionCounts.view_course = item.count;
            if (item._id === 'enroll') actionCounts.enroll = item.count;
            if (item._id === 'complete_lesson') actionCounts.complete_lesson = item.count;
        });

        return {
            data: items,
            metadata: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
                actionCounts,
            },
        };
    }

    async getTrackingById(id: string) {
        if (!Types.ObjectId.isValid(id)) {
            throw new NotFoundException('Tracking log not found');
        }

        const doc = await this.userLogModel.findById(id).lean();
        if (!doc) {
            throw new NotFoundException('Tracking log not found');
        }

        return {
            id: String(doc._id),
            userId: String(doc.userId),
            courseId: String(doc.courseId),
            action: doc.action,
            timestamp: doc.timestamp,
        };
    }

    async updateTracking(id: string, payload: UpdateTrackingDto) {
        if (!Types.ObjectId.isValid(id)) {
            throw new NotFoundException('Tracking log not found');
        }

        const updateData: Record<string, unknown> = {};
        if (payload.userId) updateData.userId = payload.userId;
        if (payload.courseId) updateData.courseId = payload.courseId;
        if (payload.action) updateData.action = payload.action;
        if (payload.timestamp) updateData.timestamp = new Date(payload.timestamp);

        const updated = await this.userLogModel
            .findByIdAndUpdate(id, { $set: updateData }, { new: true })
            .lean();

        if (!updated) {
            throw new NotFoundException('Tracking log not found');
        }

        return {
            id: String(updated._id),
            userId: String(updated.userId),
            courseId: String(updated.courseId),
            action: updated.action,
            timestamp: updated.timestamp,
        };
    }

    async deleteTracking(id: string) {
        if (!Types.ObjectId.isValid(id)) {
            throw new NotFoundException('Tracking log not found');
        }

        const deleted = await this.userLogModel.findByIdAndDelete(id).lean();
        if (!deleted) {
            throw new NotFoundException('Tracking log not found');
        }

        return {
            id: String(deleted._id),
            message: 'Tracking log deleted successfully',
        };
    }
}