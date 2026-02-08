import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  VideoProcessingJob,
  VideoProcessingJobStatus,
} from './video-processing-job.entity';
import type { IStorageClient } from '../storage/storage.interface';
import type { MulterFile } from './types';

@Injectable()
export class VideoProcessingJobService {
  constructor(
    @InjectRepository(VideoProcessingJob)
    private readonly videoProcessingJobRepository: Repository<VideoProcessingJob>,
    @Inject('IStorageClient')
    private readonly storageService: IStorageClient,
  ) {}

  async create(userId: string, file: MulterFile): Promise<VideoProcessingJob> {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    const job = this.videoProcessingJobRepository.create({
      userId,
      fileName: file.originalname,
      status: VideoProcessingJobStatus.QUEUED,
    });

    const fileName = `${userId}/${job.id}/${file.originalname}`;
    await this.storageService.putObject(fileName, file.buffer);

    const savedJob = await this.videoProcessingJobRepository.save(job);

    return savedJob;
  }
}
