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
    const endPoint: string = this.configService.getOrThrow('MINIO_ENDPOINT');
    const port: number = this.configService.getOrThrow('MINIO_PORT');

    this.minioClient = new Minio.Client({
      endPoint,
      port,
      accessKey: this.configService.getOrThrow('MINIO_ACCESS_KEY'),
      secretKey: this.configService.getOrThrow('MINIO_SECRET_KEY'),
      useSSL: false,
    });

    this.videoBucketName = this.configService.getOrThrow('BUCKET_VIDEO_NAME');
  }

  async generateUploadUrl(fileName: string): Promise<string> {
    return this.minioClient.presignedPutObject(
      this.videoBucketName,
      fileName,
      60,
    );
  }
}
