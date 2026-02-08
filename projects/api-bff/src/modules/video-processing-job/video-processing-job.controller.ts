import {
  Controller,
  Post,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { UserId } from '../auth/user-id.decorator';
import { VideoProcessingJobService } from './video-processing-job.service';
import { VideoProcessingJob } from './video-processing-job.entity';
import type { MulterFile } from './types';

@Controller('video-processing-job')
@UseGuards(JwtAuthGuard)
export class VideoProcessingJobController {
  constructor(
    private readonly videoProcessingJobService: VideoProcessingJobService,
  ) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async create(
    @UserId() userId: string,
    @UploadedFile() file: MulterFile,
  ): Promise<VideoProcessingJob> {
    return await this.videoProcessingJobService.create(userId, file);
  }
}
