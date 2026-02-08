import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Minio from 'minio';
import type { AppConfig } from '../../config/validate-env';
import type { IStorageClient } from './storage.interface';

@Injectable()
export class StorageService implements IStorageClient {
  private minioClient: Minio.Client;
  private srcBucketName: string;

  constructor(private readonly configService: ConfigService<AppConfig>) {
    this.minioClient = new Minio.Client({
      endPoint: this.configService.get('MINIO_ENDPOINT', { infer: true })!,
      port: this.configService.get('MINIO_PORT', { infer: true })!,
      accessKey: this.configService.get('MINIO_ACCESS_KEY', { infer: true })!,
      secretKey: this.configService.get('MINIO_SECRET_KEY', { infer: true })!,
      useSSL: false,
    });

    this.srcBucketName = this.configService.get('SRC_BUCKET_NAME', {
      infer: true,
    })!;
  }

  async generateUploadUrl(fileName: string): Promise<string> {
    const expiry = 60 * 60;
    const url = await this.minioClient.presignedPutObject(
      this.srcBucketName,
      fileName,
      expiry,
    );
    return url;
  }

  async generateDownloadUrl(fileName: string): Promise<string> {
    const expiry = 60 * 60;
    const url = await this.minioClient.presignedGetObject(
      this.srcBucketName,
      fileName,
      expiry,
    );
    return url;
  }
}
