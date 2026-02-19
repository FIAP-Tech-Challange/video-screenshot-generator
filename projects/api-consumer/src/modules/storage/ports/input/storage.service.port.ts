import { PresignedUrlDto } from '../../models/dto/presigned-url.dto';

export interface StorageServicePort {
  getPresignedUploadUrl(contentType?: string): Promise<PresignedUrlDto>;
  generateAndSaveScreenshots(videoKey: string): Promise<any>;
  getPresignedDownloadUrl(
    key: string,
  ): Promise<{ url: string; expiresIn: number }>;
}
