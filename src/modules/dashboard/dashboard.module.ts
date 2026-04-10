import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Course, CourseSchema } from '../course/schemas/course.schema';
import { Payment, PaymentSchema } from '../payment/schemas/payment.schema';
import { User, UserSchema } from '../user/schemas/user.schema';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Course.name, schema: CourseSchema },
      { name: User.name, schema: UserSchema },
      { name: Payment.name, schema: PaymentSchema },
    ]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
