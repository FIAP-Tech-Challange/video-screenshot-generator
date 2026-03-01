import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VideoProcessingJob } from './video-processing-job.entity';
import { VideoProcessingJobService } from './video-processing-job.service';
import { VideoProcessingJobController } from './video-processing-job.controller';
import { AuthModule } from '../auth/auth.module';
import { StorageModule } from '../storage/storage.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([VideoProcessingJob]),
    AuthModule,
    StorageModule,
  ],
  controllers: [VideoProcessingJobController],
  providers: [VideoProcessingJobService],
  exports: [VideoProcessingJobService, TypeOrmModule],
})
export class VideoProcessingJobModule { }
