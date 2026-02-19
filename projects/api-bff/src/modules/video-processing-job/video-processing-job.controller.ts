import {
  Body,
  BadRequestException,
  Controller,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { UserId } from '../auth/user-id.decorator';
import { VideoProcessingJobService } from './video-processing-job.service';
import { VideoProcessingJob } from './video-processing-job.entity';

@Controller('video-processing-job')
@UseGuards(JwtAuthGuard)
export class VideoProcessingJobController {
  constructor(
    private readonly videoProcessingJobService: VideoProcessingJobService,
  ) {}

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
}
