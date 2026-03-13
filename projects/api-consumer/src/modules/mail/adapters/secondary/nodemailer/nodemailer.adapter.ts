import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import type { MailSenderPort } from '../../../ports/mail-sender.port';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class NodemailerAdapter implements MailSenderPort {
  private readonly logger = new Logger(NodemailerAdapter.name);
  private transporter: nodemailer.Transporter;

  constructor(private readonly configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host:
        this.configService.get<string>('SMTP_HOST') || 'smtp.ethereal.email',
      port: parseInt(this.configService.get<string>('SMTP_PORT') || '587', 10),
      auth: {
        user: this.configService.get<string>('SMTP_USER') || 'ethereal_user',
        pass: this.configService.get<string>('SMTP_PASS') || 'ethereal_pass',
      },
      tls: {
        rejectUnauthorized: false,
      },
    });
  }

  async sendEmail(
    to: string,
    subject: string,
    body: string,
    html?: string,
  ): Promise<void> {
    try {
      const info = await this.transporter.sendMail({
        from: '"Video Processing App" <no-reply@videoprocessing.com>',
        to,
        subject,
        text: body,
        html,
      });

      this.logger.log(`Email sent: ${info.messageId}`);
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}`, error);
      throw error;
    }
  }
}
