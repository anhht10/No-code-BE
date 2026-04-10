import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Course, CourseDocument } from '../course/schemas/course.schema';
import { Payment, PaymentDocument } from '../payment/schemas/payment.schema';
import { User, UserDocument } from '../user/schemas/user.schema';
import { UserLog, UserLogDocument } from '../user_log/schemas/user_log.schema';

type Metric = {
  value: number;
  growthPercent: number;
  trendUp: boolean;
  currentMonth: number;
  previousMonth: number;
};

type DashboardInsightsOptions = {
  months?: number;
  limit?: number;
};

type MonthlyPoint = {
  month: string;
  value: number;
};

@Injectable()
export class DashboardService {
  constructor(
    @InjectModel(Course.name)
    private readonly courseModel: Model<CourseDocument>,
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    @InjectModel(Payment.name)
    private readonly paymentModel: Model<PaymentDocument>,
    @InjectModel(UserLog.name)
    private readonly userLogModel: Model<UserLogDocument>,
  ) {}

  async getOverviewStats() {
    const { previousMonthStart, currentMonthStart, nextMonthStart } =
      this.getMonthBoundaries(new Date());

    const [
      totalCourses,
      currentMonthCourses,
      previousMonthCourses,
      totalUsers,
      currentMonthUsers,
      previousMonthUsers,
      totalEnrollments,
      currentMonthEnrollments,
      previousMonthEnrollments,
      totalRevenue,
      currentMonthRevenue,
      previousMonthRevenue,
    ] = await Promise.all([
      this.courseModel.countDocuments(),
      this.countCreatedInRange(this.courseModel, currentMonthStart, nextMonthStart),
      this.countCreatedInRange(this.courseModel, previousMonthStart, currentMonthStart),

      this.userModel.countDocuments(),
      this.countCreatedInRange(this.userModel, currentMonthStart, nextMonthStart),
      this.countCreatedInRange(this.userModel, previousMonthStart, currentMonthStart),

      this.countCompletedPayments(),
      this.countCompletedPayments(currentMonthStart, nextMonthStart),
      this.countCompletedPayments(previousMonthStart, currentMonthStart),

      this.sumRevenue(),
      this.sumRevenue(currentMonthStart, nextMonthStart),
      this.sumRevenue(previousMonthStart, currentMonthStart),
    ]);

    return {
      totalCourses: this.buildMetric(
        totalCourses,
        currentMonthCourses,
        previousMonthCourses,
      ),
      totalUsers: this.buildMetric(
        totalUsers,
        currentMonthUsers,
        previousMonthUsers,
      ),
      totalEnrollments: this.buildMetric(
        totalEnrollments,
        currentMonthEnrollments,
        previousMonthEnrollments,
      ),
      revenue: this.buildMetric(totalRevenue, currentMonthRevenue, previousMonthRevenue),
      generatedAt: new Date().toISOString(),
    };
  }

  async getInsights(options: DashboardInsightsOptions = {}) {
    const months = this.clampNumber(options.months, 6, 1, 24);
    const limit = this.clampNumber(options.limit, 8, 1, 50);

    const monthRanges = this.buildMonthRanges(months, new Date());
    const rangeStart = monthRanges[0].start;
    const rangeEnd = monthRanges[monthRanges.length - 1].end;

    const [enrollmentRaw, revenueRaw, recentActivities] = await Promise.all([
      this.getMonthlyEnrollmentRaw(rangeStart, rangeEnd),
      this.getMonthlyRevenueRaw(rangeStart, rangeEnd),
      this.getRecentActivities(limit),
    ]);

    const enrollmentTrend = this.mapMonthlyData(monthRanges, enrollmentRaw);
    const revenueTrend = this.mapMonthlyData(monthRanges, revenueRaw);

    return {
      enrollmentTrend,
      revenueTrend,
      recentActivities,
      generatedAt: new Date().toISOString(),
    };
  }

  private buildMetric(
    value: number,
    currentMonth: number,
    previousMonth: number,
  ): Metric {
    const growthPercent = this.calculateGrowthPercent(currentMonth, previousMonth);

    return {
      value,
      growthPercent,
      trendUp: growthPercent >= 0,
      currentMonth,
      previousMonth,
    };
  }

  private calculateGrowthPercent(currentValue: number, previousValue: number) {
    if (previousValue === 0) {
      return currentValue > 0 ? 100 : 0;
    }

    const percent = ((currentValue - previousValue) / previousValue) * 100;
    return Math.round(percent);
  }

  private getMonthBoundaries(now: Date) {
    const currentMonthStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      1,
      0,
      0,
      0,
      0,
    );
    const nextMonthStart = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      1,
      0,
      0,
      0,
      0,
    );
    const previousMonthStart = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      1,
      0,
      0,
      0,
      0,
    );

    return {
      previousMonthStart,
      currentMonthStart,
      nextMonthStart,
    };
  }

  private countCreatedInRange(
    model: Model<any>,
    start: Date,
    end: Date,
  ) {
    const query: Record<string, unknown> = {
      createdAt: {
        $gte: start,
        $lt: end,
      },
    };

    return model.countDocuments(query);
  }

  private countCompletedPayments(start?: Date, end?: Date) {
    const query: Record<string, unknown> = {
      status: { $in: ['completed', 'success'] },
    };

    if (start && end) {
      query.$or = [
        {
          payDate: {
            $gte: start,
            $lt: end,
          },
        },
        {
          payDate: { $exists: false },
          createdAt: {
            $gte: start,
            $lt: end,
          },
        },
        {
          payDate: null,
          createdAt: {
            $gte: start,
            $lt: end,
          },
        },
      ];
    }

    return this.paymentModel.countDocuments(query);
  }

  private async sumRevenue(start?: Date, end?: Date) {
    const matchStage: Record<string, unknown> = {
      status: { $in: ['completed', 'success'] },
    };

    if (start && end) {
      matchStage.$expr = {
        $and: [
          {
            $gte: [{ $ifNull: ['$payDate', '$createdAt'] }, start],
          },
          {
            $lt: [{ $ifNull: ['$payDate', '$createdAt'] }, end],
          },
        ],
      };
    }

    const [result] = await this.paymentModel.aggregate([{ $match: matchStage }, { $group: { _id: null, totalRevenue: { $sum: '$amount' } } }]);

    return result?.totalRevenue || 0;
  }

  private clampNumber(value: number | undefined, fallback: number, min: number, max: number) {
    if (!Number.isFinite(value)) {
      return fallback;
    }
    return Math.max(min, Math.min(max, Math.floor(value!)));
  }

  private buildMonthRanges(months: number, now: Date) {
    const output: Array<{ key: string; label: string; start: Date; end: Date }> = [];

    for (let i = months - 1; i >= 0; i -= 1) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1, 0, 0, 0, 0);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 1, 0, 0, 0, 0);
      const key = `${monthStart.getFullYear()}-${String(monthStart.getMonth() + 1).padStart(2, '0')}`;
      const label = monthStart.toLocaleString('en-US', { month: 'short' });

      output.push({ key, label, start: monthStart, end: monthEnd });
    }

    return output;
  }

  private async getMonthlyEnrollmentRaw(start: Date, end: Date) {
    return this.paymentModel.aggregate<{ key: string; value: number }>([
      {
        $match: {
          status: { $in: ['completed', 'success'] },
        },
      },
      {
        $addFields: {
          effectiveDate: { $ifNull: ['$payDate', '$createdAt'] },
        },
      },
      {
        $match: {
          effectiveDate: { $gte: start, $lt: end },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$effectiveDate' },
            month: { $month: '$effectiveDate' },
          },
          value: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          key: {
            $concat: [
              { $toString: '$_id.year' },
              '-',
              {
                $cond: [
                  { $lt: ['$_id.month', 10] },
                  { $concat: ['0', { $toString: '$_id.month' }] },
                  { $toString: '$_id.month' },
                ],
              },
            ],
          },
          value: 1,
        },
      },
    ]);
  }

  private async getMonthlyRevenueRaw(start: Date, end: Date) {
    return this.paymentModel.aggregate<{ key: string; value: number }>([
      {
        $match: {
          status: { $in: ['completed', 'success'] },
        },
      },
      {
        $addFields: {
          effectiveDate: { $ifNull: ['$payDate', '$createdAt'] },
        },
      },
      {
        $match: {
          effectiveDate: { $gte: start, $lt: end },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$effectiveDate' },
            month: { $month: '$effectiveDate' },
          },
          value: { $sum: '$amount' },
        },
      },
      {
        $project: {
          _id: 0,
          key: {
            $concat: [
              { $toString: '$_id.year' },
              '-',
              {
                $cond: [
                  { $lt: ['$_id.month', 10] },
                  { $concat: ['0', { $toString: '$_id.month' }] },
                  { $toString: '$_id.month' },
                ],
              },
            ],
          },
          value: 1,
        },
      },
    ]);
  }

  private mapMonthlyData(
    monthRanges: Array<{ key: string; label: string }>,
    rows: Array<{ key: string; value: number }>,
  ): MonthlyPoint[] {
    const index = new Map(rows.map((item) => [item.key, item.value]));

    return monthRanges.map((item) => ({
      month: item.label,
      value: index.get(item.key) ?? 0,
    }));
  }

  private async getRecentActivities(limit: number) {
    return this.userLogModel.aggregate([
      {
        $sort: { timestamp: -1 },
      },
      {
        $limit: limit,
      },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user',
        },
      },
      {
        $lookup: {
          from: 'courses',
          localField: 'courseId',
          foreignField: '_id',
          as: 'course',
        },
      },
      {
        $project: {
          _id: 0,
          action: 1,
          timestamp: 1,
          userName: {
            $ifNull: [
              { $arrayElemAt: ['$user.name', 0] },
              {
                $ifNull: [
                  { $arrayElemAt: ['$user.username', 0] },
                  { $arrayElemAt: ['$user.email', 0] },
                ],
              },
            ],
          },
          courseTitle: { $arrayElemAt: ['$course.title', 0] },
          courseSlug: { $arrayElemAt: ['$course.slug', 0] },
        },
      },
      {
        $addFields: {
          courseUrl: {
            $cond: [
              { $ifNull: ['$courseSlug', false] },
              { $concat: ['/user/courses/', '$courseSlug'] },
              null,
            ],
          },
        },
      },
    ]);
  }
}
