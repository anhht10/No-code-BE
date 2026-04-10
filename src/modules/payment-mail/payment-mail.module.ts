import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PaymentMailController } from './payment-mail.controller';
import { PaymentMailService } from './payment-mail.service';
import { PaymentMail, PaymentMailSchema } from './schemas/payment-mail.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PaymentMail.name, schema: PaymentMailSchema },
    ]),
  ],
  controllers: [PaymentMailController],
  providers: [PaymentMailService],
  exports: [PaymentMailService],
})
export class PaymentMailModule {}
