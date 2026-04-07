import { Logger } from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import * as dotenv from 'dotenv';
import { AppModule } from './app.module';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
dotenv.config();
async function bootstrap() {
  const logger = new Logger('Bootstrap')
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.useGlobalInterceptors(new TransformInterceptor(app.get(Reflector)));
  
  app.use(cookieParser());

  const configSwagger =  new DocumentBuilder()
    .setTitle('Autocode API')
    .setDescription('The Autocode API description')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, configSwagger);
  SwaggerModule.setup('docs', app, document);

  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 3001);
  logger.log(`Application is running on: http://localhost:${process.env.PORT ?? 3001}`);
  logger.log(`Swagger docs available at: http://localhost:${process.env.PORT ?? 3001}/docs`);
}
bootstrap();


