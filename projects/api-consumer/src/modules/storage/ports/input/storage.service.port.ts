export interface StorageServicePort {
  generateAndSaveScreenshots(videoKey: string, jobId: string): Promise<void>;
}
