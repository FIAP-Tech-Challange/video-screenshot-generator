import { Module } from '@nestjs/common';
import { EventController } from './adapters/primary/event.controller';
import { EventService } from './services/event.service';
import { StorageModule } from '../storage/storage.module';
import { VideoProcessingModule } from '../video-processing/video-processing.module';

@Module({
  imports: [StorageModule, VideoProcessingModule],
  controllers: [EventController],
  providers: [EventService],
})
export class EventModule {}
