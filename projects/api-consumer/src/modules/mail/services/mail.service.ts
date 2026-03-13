import { Injectable, Inject, Logger } from '@nestjs/common';
import type { MailSenderPort } from '../ports/mail-sender.port';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(
    @Inject('MailSenderPort')
    private readonly mailSender: MailSenderPort,
  ) {}

  async sendEmail(
    to: string,
    subject: string,
    body: string,
    html?: string,
  ): Promise<void> {
    this.logger.log(`Attempting to send email to ${to}`);
    await this.mailSender.sendEmail(to, subject, body, html);
  }

  async sendVideoProcessingSuccessEmail(
    to: string,
    name?: string,
  ): Promise<void> {
    const subject = 'Video Processado com sucesso :)';
    const text =
      'O processamento do vídeo foi concluído com sucesso, acesse aba de "Meus Vídeos" para baixar os screenshots.';
    const html = `
      <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #4CAF50; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">🎉 Vídeo Processado!</h1>
        </div>
        <div style="padding: 20px; text-align: center;">
          <p style="font-size: 16px;">Olá, ${name ?? ''}</p>
          <p style="font-size: 16px; line-height: 1.5;">${text}</p>
          <a href="http://localhost:4200/videos" style="display: inline-block; margin-top: 20px; padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 4px; font-weight: bold;">Ver Meus Vídeos</a>
        </div>
        <div style="background-color: #f1f1f1; padding: 10px; text-align: center; font-size: 12px; color: #777;">
          <p>Video Screenshot Generator &copy; ${new Date().getFullYear()}</p>
        </div>
      </div>
    `;

    await this.sendEmail(to, subject, text, html);
  }

  async sendVideoProcessingErrorEmail(
    to: string,
    jobId: string,
  ): Promise<void> {
    const subject = 'Falha no Processamento de Vídeo';
    const text = `Tivemos um problema ao processar o seu vídeo (Job ID: ${jobId}).`;

    const html = `
      <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #f44336; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">⚠️ Falha no Processamento</h1>
        </div>
        <div style="padding: 20px; text-align: center;">
          <p style="font-size: 16px;">Olá,</p>
          <p style="font-size: 16px; line-height: 1.5;">${text}</p>
          <p style="font-size: 14px; color: #555; margin-top: 15px;">
            Houve um erro interno ao processar as capturas de tela do seu vídeo. 
            Por favor, tente fazer o upload novamente mais tarde.
          </p>
        </div>
        <div style="background-color: #f1f1f1; padding: 10px; text-align: center; font-size: 12px; color: #777;">
          <p>Video Screenshot Generator &copy; ${new Date().getFullYear()}</p>
        </div>
      </div>
    `;

    await this.sendEmail(to, subject, text, html);
  }
}
