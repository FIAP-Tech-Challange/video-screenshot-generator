import {
  Body,
  BadRequestException,
  Controller,
  Get,
  Post,
  Param,
} from '@nestjs/common';
import { UserId } from '../auth/user-id.decorator';
import { VideoProcessingJobService } from './video-processing-job.service';
import { VideoProcessingJob } from './video-processing-job.entity';

@Controller('video-processing-job')
export class VideoProcessingJobController {
  constructor(
    private readonly videoProcessingJobService: VideoProcessingJobService,
  ) {}

  @Get()
  async list(@UserId() userId: string): Promise<VideoProcessingJob[]> {
    return this.videoProcessingJobService.findByUserId(userId);
  }

  @Post()
  async create(
    @UserId() userId: string,
    @Body('fileName') fileName: string,
  ): Promise<{ job: VideoProcessingJob; uploadUrl: string }> {
    const normalizedFileName =
      typeof fileName === 'string' ? fileName.trim() : '';

    if (!normalizedFileName) {
      throw new BadRequestException('fileName is required');
    }

    return this.videoProcessingJobService.create(userId, normalizedFileName);
  }

  @Get(':jobId/screenshots')
  async getScreenshotsDownloadUrl(
    @UserId() userId: string,
    @Param('jobId') jobId: string,
  ): Promise<{ downloadUrl: string }> {
    const downloadUrl =
      await this.videoProcessingJobService.getScreenshotsDownloadUrl(
        userId,
        jobId,
      );

    return { downloadUrl };
  }
}
