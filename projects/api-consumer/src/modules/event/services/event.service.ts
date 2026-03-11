import { Injectable, Logger } from '@nestjs/common';
import { StorageService } from '../../storage/services/storage.service';
import { EventServicePort } from '../ports/input/event.service.port';
import { VideoProcessingService } from 'src/modules/video-processing/services/video-processing.service';
import { UploadObjectEventPayload } from '../types/upload-object.type';
import { MailService } from '../../mail/services/mail.service';
import { NotificationService } from '../../notification/services/notification.service';

@Injectable()
export class EventService implements EventServicePort {
  private readonly logger = new Logger(EventService.name);

  constructor(
    private readonly storageService: StorageService,
    private readonly videoProcessingService: VideoProcessingService,
    private readonly mailService: MailService,
    private readonly notificationService: NotificationService,
  ) {}

  async handleVideoUpload(event: UploadObjectEventPayload): Promise<void> {
    this.logger.log(`Event received: upload-video.`);

    let jobId: string | null = null;

    try {
      const validatedData = this.validateEvent(event);
      jobId = validatedData.jobId;

      const videoJob = await this.videoProcessingService.findJobById(jobId);
      if (!videoJob) {
        throw new Error(`No video processing job found for ID: ${jobId}`);
      }

      await this.storageService.generateAndSaveScreenshots(
        validatedData.objectKey,
        jobId,
      );

      await this.videoProcessingService.updateToProcessed(jobId);

      this.logger.log(`Processing completed for video job ID: ${jobId}`);

      await this.mailService.sendVideoProcessingSuccessEmail(
        videoJob.user.email,
        videoJob.user.name,
      );
      const successMessage = `O processamento do vídeo foi concluído com sucesso, acesse aba de "Meus Vídeos" para baixar os screenshots.`;
      await this.notificationService.createNotification(jobId, successMessage);
    } catch (error) {
      this.logger.error('Error handling video upload event', error);

      if (jobId) {
        try {
          await this.videoProcessingService.updateToError(jobId, error.message);

          const errorMessage = `Video processing failed for job ${jobId}: ${error.message}`;

          const videoJob = await this.videoProcessingService.findJobById(jobId);
          if (videoJob) {
            await this.mailService.sendVideoProcessingErrorEmail(
              videoJob.user.email,
              jobId,
            );
            await this.notificationService.createNotification(
              jobId,
              errorMessage,
            );
          }
        } catch (recoveryError) {
          this.logger.error(
            `Failed to execute recovery steps for job ${jobId}`,
            recoveryError,
          );
        }
      }
    }
  }

  private validateEvent(event: UploadObjectEventPayload) {
    const record = event.Records?.[0];
    if (!record) {
      throw new Error('No records found in the event payload');
    }

    const objectKey = decodeURIComponent(
      record.s3.object.key.replace(/\+/g, ' '),
    );
    const [jobId, objectExt] = objectKey.split('.');
    const contentType = record.s3.object.contentType;

    if (contentType !== 'video/mp4' && objectExt !== 'mp4') {
      throw new Error(
        `Invalid file type: ${contentType}. Only MP4 videos are supported.`,
      );
    }

    return {
      jobId: jobId,
      objectKey: objectKey,
    };
  }
}
