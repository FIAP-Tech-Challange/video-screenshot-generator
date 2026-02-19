import {
  VideoProcessingJob,
  VideoProcessingJobStatus,
} from '../models/video-processing-job.entity';

export interface VideoProcessingRepositoryPort {
  findById(id: string): Promise<VideoProcessingJob | null>;
  findByFileName(fileName: string): Promise<VideoProcessingJob | null>;
  updateStatus(
    id: string,
    status: VideoProcessingJobStatus,
    errorReason?: string,
    processedAt?: Date,
  ): Promise<void>;
}
