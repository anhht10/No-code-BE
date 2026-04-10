import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Course, CourseDocument } from '../course/schemas/course.schema';
import { Payment, PaymentDocument } from '../payment/schemas/payment.schema';
import { User, UserDocument } from '../user/schemas/user.schema';

type Metric = {
  value: number;
  growthPercent: number;
  trendUp: boolean;
  currentMonth: number;
  previousMonth: number;
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
}
