import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  VideoProcessingJob,
  VideoProcessingJobStatus,
} from './video-processing-job.entity';
import type { IStorageClient } from '../storage/storage.interface';

@Injectable()
export class VideoProcessingJobService {
  constructor(
    @InjectRepository(VideoProcessingJob)
    private readonly videoProcessingJobRepository: Repository<VideoProcessingJob>,
    @Inject('IStorageClient')
    private readonly storageService: IStorageClient,
  ) {}

  async create(
    userId: string,
    fileName: string,
  ): Promise<{ job: VideoProcessingJob; uploadUrl: string }> {
    const job = this.videoProcessingJobRepository.create({
      userId,
      fileName,
      status: VideoProcessingJobStatus.QUEUED,
    });

    const savedJob = await this.videoProcessingJobRepository.save(job);

    const objectKey = `${userId}/${savedJob.id}/${fileName}`;
    const uploadUrl = await this.storageService.generateUploadUrl(objectKey);

    return { job: savedJob, uploadUrl };
  }

  async findByUserId(userId: string): Promise<VideoProcessingJob[]> {
    return this.videoProcessingJobRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }
}
