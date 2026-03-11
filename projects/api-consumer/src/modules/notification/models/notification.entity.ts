import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity({ name: 'notifications' })
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'processing_job_id' })
  processingJobId: string;

  @Column({ type: 'varchar', length: 255 })
  message: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
