import { Injectable, Logger } from '@nestjs/common';
import { StorageService } from '../../storage/services/storage.service';
import { EventServicePort } from '../ports/input/event.service.port';
import { VideoProcessingService } from 'src/modules/video-processing/services/video-processing.service';
import { VideoProcessingJobStatus } from 'src/modules/video-processing/models/video-processing-job.entity';

@Injectable()
export class EventService implements EventServicePort {
  private readonly logger = new Logger(EventService.name);

  constructor(
    private readonly storageService: StorageService,
    private readonly videoProcessingService: VideoProcessingService,
  ) {}

  async handleVideoUpload(payload: any): Promise<void> {
    this.logger.log(
      `Event received: upload-video - key: ${payload.Key ?? payload.key}`,
    );

    try {
      let key = payload.Key || payload.key;

      if (
        payload.Records &&
        payload.Records[0] &&
        payload.Records[0].s3 &&
        payload.Records[0].s3.object
      ) {
        key = payload.Records[0].s3.object.key;
        key = decodeURIComponent(key.replace(/\+/g, ' '));
      }

      if (!key) {
        this.logger.error('Could not extract video key from payload', payload);
        return;
      }

      if (!key.endsWith('.mp4')) {
        this.logger.error(
          `File ${key} is not a supported video format. Skipping.`,
        );
        return;
      }

      this.logger.log(`Initiating processing for ${key}`);
      await this.storageService.generateAndSaveScreenshots(key);
      const videoProcessingJob =
        await this.videoProcessingService.findJobByFileName(key);
      if (videoProcessingJob) {
        await this.videoProcessingService.updateStatus(
          videoProcessingJob.id,
          VideoProcessingJobStatus.SUCCESS,
        );
      }
      this.logger.log(`Processing completed for ${key}`);
    } catch (error) {
      this.logger.error('Error handling video upload event', error);
      const videoProcessingJob =
        await this.videoProcessingService.findJobByFileName(error.payload.key);
      if (videoProcessingJob) {
        await this.videoProcessingService.updateStatus(
          videoProcessingJob.id,
          VideoProcessingJobStatus.ERROR,
          error.message,
        );
      }
    }
  }
}
