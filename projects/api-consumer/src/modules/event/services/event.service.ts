import { Injectable, Logger } from '@nestjs/common';
import { StorageService } from '../../storage/services/storage.service';
import { EventServicePort } from '../ports/input/event.service.port';
import { VideoProcessingService } from 'src/modules/video-processing/services/video-processing.service';
import { UploadObjectEventPayload } from '../types/upload-object.type';

@Injectable()
export class EventService implements EventServicePort {
  private readonly logger = new Logger(EventService.name);

  constructor(
    private readonly storageService: StorageService,
    private readonly videoProcessingService: VideoProcessingService,
  ) {}

  async handleVideoUpload(event: UploadObjectEventPayload): Promise<void> {
    this.logger.log(`Event received: upload-video.`);

    const rawKey = event.Records?.[0]?.s3?.object?.key;
    let jobId: string | null = rawKey
      ? decodeURIComponent(rawKey.replace(/\+/g, ' ')).split('.')[0]
      : null;

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
    } catch (error) {
      this.logger.error('Error handling video upload event', error);

      if (jobId) {
        await this.videoProcessingService.updateToError(jobId, error.message);
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
