import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VideoProcessingJob } from './models/video-processing-job.entity';
import { VideoProcessingRepositoryAdapter } from './adapters/secondary/database/video-processing-repository.adapter';
import { VideoProcessingService } from './services/video-processing.service';

@Module({
  imports: [TypeOrmModule.forFeature([VideoProcessingJob])],
  providers: [
    VideoProcessingService,
    {
      provide: 'VideoProcessingRepositoryPort',
      useClass: VideoProcessingRepositoryAdapter,
    },
  ],
  exports: [VideoProcessingService],
})
export class VideoProcessingModule {}
