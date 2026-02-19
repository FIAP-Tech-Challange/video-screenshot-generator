import { Module } from '@nestjs/common';
import { StorageController } from './adapters/primary/storage.controller';
import { S3StorageAdapter } from './adapters/secondary/s3-storage.adapter';
import { FfmpegVideoAdapter } from './adapters/secondary/ffmpeg-video.adapter';
import { StorageService } from './services/storage.service';

@Module({
  imports: [],
  controllers: [StorageController],
  providers: [
    StorageService,
    {
      provide: 'FileStoragePort',
      useClass: S3StorageAdapter,
    },
    {
      provide: 'VideoProcessorPort',
      useClass: FfmpegVideoAdapter,
    },
  ],
  exports: [StorageService],
})
export class StorageModule {}
