import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  VideoProcessingJob,
  VideoProcessingJobStatus,
} from '../../../models/video-processing-job.entity';
import { VideoProcessingRepositoryPort } from '../../../ports/video-processing-repository.port';

@Injectable()
export class VideoProcessingRepositoryAdapter implements VideoProcessingRepositoryPort {
  constructor(
    @InjectRepository(VideoProcessingJob)
    private readonly repository: Repository<VideoProcessingJob>,
  ) {}

  async findById(id: string): Promise<VideoProcessingJob | null> {
    return this.repository.findOne({ where: { id } });
  }

  async updateStatus(
    id: string,
    status: VideoProcessingJobStatus,
    errorReason?: string,
    processedAt?: Date,
  ): Promise<void> {
    const updateData: Partial<VideoProcessingJob> = { status };
    if (errorReason !== undefined) {
      updateData.errorReason = errorReason;
    }
    if (processedAt !== undefined) {
      updateData.processedAt = processedAt;
    }
    await this.repository.update(id, updateData);
  }
}
