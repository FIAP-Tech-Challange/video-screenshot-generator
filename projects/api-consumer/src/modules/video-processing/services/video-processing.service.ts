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

  async updateStatus(
    id: string,
    status: VideoProcessingJobStatus,
    errorReason?: string,
  ): Promise<void> {
    const processedAt =
      status === VideoProcessingJobStatus.SUCCESS ||
      status === VideoProcessingJobStatus.ERROR
        ? new Date()
        : undefined;
    await this.repository.updateStatus(id, status, errorReason, processedAt);
    this.logger.log(`Job ${id} status updated to ${status}`);
  }

  async findJobById(id: string): Promise<VideoProcessingJob | null> {
    return this.repository.findById(id);
  }

  async findJobByFileName(
    fileName: string,
  ): Promise<VideoProcessingJob | null> {
    return this.repository.findByFileName(fileName);
  }
}
