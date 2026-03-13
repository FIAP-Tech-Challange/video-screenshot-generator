import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

export enum VideoProcessingJobStatus {
  QUEUED = 'queued',
  PROCESSING = 'processing',
  ERROR = 'error',
  SUCCESS = 'success',
}

@Entity({ name: 'video_processing_jobs' })
export class VideoProcessingJob {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'user_id' })
  userId: string;

  @Column({ type: 'varchar', name: 'file_name' })
  fileName: string;

  @Column({
    type: 'enum',
    enum: VideoProcessingJobStatus,
    default: VideoProcessingJobStatus.QUEUED,
  })
  status: VideoProcessingJobStatus;

  @Column({ type: 'varchar', name: 'error_reason', nullable: true })
  errorReason: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Column({ type: 'timestamp', name: 'processed_at', nullable: true })
  processedAt: Date | null;
}
