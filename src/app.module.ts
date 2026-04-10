import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core/constants';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LoggerMiddleware } from './common/middlewares/logger.middleware';
import { AuthModule } from './modules/auth/auth.module';
import { JwtAuthGuard } from './modules/auth/gaurds/jwt-auth.guard';
import { CourseModuleModule } from './modules/course-module/course-module.module';
import { CourseSkillModule } from './modules/course-skill/course-skill.module';
import { CourseModule } from './modules/course/course.module';
import { IndustryModule } from './modules/industry/industry.module';
import { LessonModule } from './modules/lesson/lesson.module';
import { PaymentMailModule } from './modules/payment-mail/payment-mail.module';
import { PaymentModule } from './modules/payment/payment.module';
import { PostCategoryModule } from './modules/post-category/post-category.module';
import { SkillModule } from './modules/skill/skill.module';
import { UserModule } from './modules/user/user.module';
import { UserLogModule } from './modules/user_log/user_log.module';
import { PostModule } from './modules/post/post.module';
import { PostCategoryModule } from './modules/post-category/post-category.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // <--- Dòng này cho phép dùng ConfigService toàn app
    }),
    MongooseModule.forRootAsync({
      useFactory: () => {
        const mongoUri = process.env.MONGODB_URL;
        if (!mongoUri) {
          throw new Error('MONGODB_URL is not defined. Please check your .env file.');
        }
        return { uri: mongoUri };
      },
    }),
    CourseModule,
    CourseModuleModule,
    CourseSkillModule,
    IndustryModule,
    LessonModule,
    PaymentModule,
    PaymentMailModule,
    PostModule,
    PostCategoryModule,
    SkillModule,
    UserModule,
    UserLogModule,
    AuthModule,
  ],
    controllers: [AppController],
  providers: [AppService,
        {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes({
    path: '*path',
    method: RequestMethod.ALL,
  });
  }
}
