import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Minio from 'minio';
import type { AppConfig } from '../../config/validate-env';
import type { IStorageClient } from './storage.interface';

@Injectable()
export class StorageService implements IStorageClient {
  private minioClient: Minio.Client;
  private videoBucketName: string;

  constructor(private readonly configService: ConfigService<AppConfig>) {
    const endPoint = this.configService.get('MINIO_ENDPOINT', {
      infer: true,
    })!;
    const port = this.configService.get('MINIO_PORT', { infer: true })!;

    this.minioClient = new Minio.Client({
      endPoint,
      port,
      accessKey: this.configService.get('MINIO_ACCESS_KEY', { infer: true })!,
      secretKey: this.configService.get('MINIO_SECRET_KEY', { infer: true })!,
      useSSL: false,
    });

    this.videoBucketName = this.configService.get('BUCKET_VIDEO_NAME', {
      infer: true,
    })!;
  }

  async generateUploadUrl(fileName: string): Promise<string> {
    return this.minioClient.presignedPutObject(
      this.videoBucketName,
      fileName,
      60,
    );
  }
}
