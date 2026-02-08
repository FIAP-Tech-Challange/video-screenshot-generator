import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Minio from 'minio';
import type { AppConfig } from '../../config/validate-env';

@Injectable()
export class StorageService implements OnModuleInit {
  private minioClient: Minio.Client;
  private srcBucketName: string;

  constructor(private readonly configService: ConfigService<AppConfig>) {}

  onModuleInit() {
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
}
