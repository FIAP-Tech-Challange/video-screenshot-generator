export type VideoJobStatus = 'queued' | 'processing' | 'error' | 'success';

export interface VideoJob {
  id: string;
  userId: string;
  fileName: string;
  status: VideoJobStatus;
  errorReason: string | null;
  createdAt: string;
  processedAt: string | null;
}
