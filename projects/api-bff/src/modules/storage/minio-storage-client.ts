import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import type { AppConfig } from '../../config/validate-env';
import type { IStorageClient } from './storage-client.interface';

@Injectable()
export class MinIoStorageClient implements IStorageClient {
  private readonly privateMinioClient: S3Client;
  private readonly publicMinioClient: S3Client;

  constructor(private readonly configService: ConfigService<AppConfig>) {
    this.privateMinioClient = new S3Client({
      endpoint: this.configService.getOrThrow('MINIO_URL'),
      region: this.configService.getOrThrow('BUCKET_REGION'),
      credentials: {
        accessKeyId: this.configService.getOrThrow('MINIO_ACCESS_KEY'),
        secretAccessKey: this.configService.getOrThrow('MINIO_SECRET_KEY'),
      },
      forcePathStyle: true,
    });

    this.publicMinioClient = new S3Client({
      endpoint: this.configService.getOrThrow('MINIO_PUBLIC_URL'),
      region: this.configService.getOrThrow('BUCKET_REGION'),
      credentials: {
        accessKeyId: this.configService.getOrThrow('MINIO_ACCESS_KEY'),
        secretAccessKey: this.configService.getOrThrow('MINIO_SECRET_KEY'),
      },
      forcePathStyle: true,
    });
  }

  public async generateUploadUrl(
    bucketName: string,
    objectKey: string,
    expiresIn: number,
  ) {
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: objectKey,
    });

    try {
      const url = await getSignedUrl(this.publicMinioClient, command, {
        expiresIn: expiresIn,
      });

      return url;
    } catch (err: unknown) {
      const cause = err instanceof Error ? err.message : String(err);

      throw new Error(
        `Failed to generate upload URL for "${objectKey}": ${cause}`,
      );
    }
  }

  public async generateDownloadUrl(
    bucketName: string,
    objectKey: string,
    expiresIn: number,
  ): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: objectKey,
    });

    try {
      const url = await getSignedUrl(this.publicMinioClient, command, {
        expiresIn: expiresIn,
      });

      return url;
    } catch (err: unknown) {
      const cause = err instanceof Error ? err.message : String(err);

      throw new Error(
        `Failed to generate download URL for "${objectKey}": ${cause}`,
      );
    }
  }
}
