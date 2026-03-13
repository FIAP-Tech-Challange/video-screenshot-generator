import { Injectable, Inject, Logger } from '@nestjs/common';
import {
  VideoProcessingJob,
  VideoProcessingJobStatus,
} from '../models/video-processing-job.entity';
import type { VideoProcessingRepositoryPort } from '../ports/video-processing-repository.port';

@Injectable()
export class VideoProcessingService {
  private readonly logger = new Logger(VideoProcessingService.name);

  constructor(
    @Inject('VideoProcessingRepositoryPort')
    private readonly repository: VideoProcessingRepositoryPort,
  ) {}

  async updateToProcessed(id: string): Promise<void> {
    await this.repository.updateStatus(
      id,
      VideoProcessingJobStatus.SUCCESS,
      undefined,
      new Date(),
    );
    this.logger.log(`Job ${id} marked as processed`);
  }

  async updateToError(id: string, errorReason: string): Promise<void> {
    await this.repository.updateStatus(
      id,
      VideoProcessingJobStatus.ERROR,
      errorReason,
      new Date(),
    );
    this.logger.log(`Job ${id} marked as error: ${errorReason}`);
  }

  async findJobById(id: string): Promise<VideoProcessingJob | null> {
    return this.repository.findById(id);
  }
}
