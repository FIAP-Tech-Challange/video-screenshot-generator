import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import type { AppConfig } from '../../config/validate-env';
import type { IStorageClient } from './storage.interface';

@Injectable()
export class StorageService implements IStorageClient {
  private readonly s3Client: S3Client;
  private readonly videoBucketName: string;

  constructor(private readonly configService: ConfigService<AppConfig>) {
    this.s3Client = new S3Client({
      endpoint: this.configService.getOrThrow('MINIO_URL'),
      region: this.configService.getOrThrow('BUCKET_REGION'),
      credentials: {
        accessKeyId: this.configService.getOrThrow('MINIO_ACCESS_KEY'),
        secretAccessKey: this.configService.getOrThrow('MINIO_SECRET_KEY'),
      },
      forcePathStyle: true,
    });

    this.videoBucketName = this.configService.getOrThrow('BUCKET_VIDEO_NAME');
  }

  public async generateUploadUrl(fileName: string): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: this.videoBucketName,
      Key: fileName,
    });

    try {
      const url = await getSignedUrl(this.s3Client, command, {
        expiresIn: 60,
      });

      return url;
    } catch (err: unknown) {
      const cause = err instanceof Error ? err.message : String(err);

      throw new Error(
        `Failed to generate upload URL for "${fileName}": ${cause}`,
      );
    }
  }

  public async generateDownloadUrl(fileName: string): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.videoBucketName,
      Key: fileName,
    });

    try {
      const url = await getSignedUrl(this.s3Client, command, {
        expiresIn: 60,
      });

      return url;
    } catch (err: unknown) {
      const cause = err instanceof Error ? err.message : String(err);

      throw new Error(
        `Failed to generate download URL for "${fileName}": ${cause}`,
      );
    }
  }
}
