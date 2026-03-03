import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  VideoProcessingJob,
  VideoProcessingJobStatus,
} from './video-processing-job.entity';
import type { IStorageClient } from '../storage/storage-client.interface';
import { ConfigService } from '@nestjs/config';
import { AppConfig } from 'src/config/validate-env';

@Injectable()
export class VideoProcessingJobService {
  private readonly logger = new Logger(VideoProcessingJobService.name);
  private readonly videoBucket: string;
  private readonly screenshotsBucket: string;

  constructor(
    @InjectRepository(VideoProcessingJob)
    private readonly videoProcessingJobRepository: Repository<VideoProcessingJob>,
    @Inject('IStorageClient')
    private readonly storageService: IStorageClient,
    private readonly configService: ConfigService<AppConfig>,
  ) {
    this.videoBucket = this.configService.getOrThrow('BUCKET_VIDEO_NAME');
    this.screenshotsBucket = this.configService.getOrThrow(
      'BUCKET_SCREENSHOT_NAME',
    );
  }

  async getDownloadUrlForScreenshots(jobId: string): Promise<string> {
    const objectKey = `${jobId}.zip`;
    return this.storageService.generateDownloadUrl(
      this.screenshotsBucket,
      objectKey,
      60 * 60,
    );
  }

  async getUploadUrlForVideo(jobId: string): Promise<string> {
    const objectKey = `${jobId}.mp4`;
    return this.storageService.generateUploadUrl(
      this.videoBucket,
      objectKey,
      60 * 60,
    );
  }

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

    const uploadUrl = await this.getUploadUrlForVideo(savedJob.id);

    return { job: savedJob, uploadUrl };
  }

  async findByUserId(userId: string): Promise<VideoProcessingJob[]> {
    return this.videoProcessingJobRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async getJobById(userId: string, jobId: string): Promise<VideoProcessingJob> {
    const job = await this.videoProcessingJobRepository.findOne({
      where: { id: jobId, userId },
    });

    if (!job) {
      throw new Error('Job not found');
    }

    return job;
  }

  async getScreenshotsDownloadUrl(
    userId: string,
    jobId: string,
  ): Promise<string> {
    const job = await this.getJobById(userId, jobId);

    if (job.status !== VideoProcessingJobStatus.SUCCESS) {
      throw new Error('Job is not on success status');
    }

    const downloadUrl = await this.getDownloadUrlForScreenshots(jobId);

    return downloadUrl;
  }
}
