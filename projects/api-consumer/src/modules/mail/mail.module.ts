import { Module } from '@nestjs/common';
import { NodemailerAdapter } from './adapters/secondary/nodemailer/nodemailer.adapter';
import { MailService } from './services/mail.service';

@Module({
  providers: [
    MailService,
    {
      provide: 'MailSenderPort',
      useClass: NodemailerAdapter,
    },
  ],
  exports: [MailService],
})
export class MailModule {}
