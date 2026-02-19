import {
  CreateBucketCommand,
  GetObjectCommand,
  HeadBucketCommand,
  ListBucketsCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FileStoragePort } from '../../ports/output/file-storage.port';

@Injectable()
export class S3StorageAdapter implements FileStoragePort {
  private readonly logger = new Logger(S3StorageAdapter.name);
  private client: S3Client;

  constructor(private readonly configService: ConfigService) {
    this.client = new S3Client({
      region: this.configService.get('BUCKET_REGION') ?? 'us-east-1',
      endpoint: this.configService.get('URL_MINIO'),
      credentials: {
        accessKeyId: this.configService.getOrThrow('ACCESS_KEY_ID_MINIO'),
        secretAccessKey: this.configService.getOrThrow(
          'SECRET_ACCESS_KEY_MINIO',
        ),
      },
      forcePathStyle: true,
    });
  }

  async getPresignedUploadUrl(
    bucket: string,
    key: string,
    contentType: string,
    expiresIn: number = 3600,
  ): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      ContentType: contentType,
    });
    return getSignedUrl(this.client, command, { expiresIn });
  }

  async getPresignedDownloadUrl(
    bucket: string,
    key: string,
    expiresIn: number = 3600,
  ): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    });
    return getSignedUrl(this.client, command, { expiresIn });
  }

  async uploadFile(
    bucket: string,
    key: string,
    body: Buffer,
    contentType: string,
  ): Promise<void> {
    await this.client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: body,
        ContentType: contentType,
      }),
    );
  }

  async downloadFile(
    bucket: string,
    key: string,
  ): Promise<NodeJS.ReadableStream> {
    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    });
    const response = await this.client.send(command);
    return response.Body as unknown as NodeJS.ReadableStream;
  }

  async checkConnection(): Promise<void> {
    await this.client.send(new ListBucketsCommand({}));
    this.logger.log('Connection with bucket established successfully');
  }

  async ensureBucketExists(bucketName: string): Promise<void> {
    try {
      await this.client.send(new HeadBucketCommand({ Bucket: bucketName }));
      this.logger.log(`Bucket "${bucketName}" already exists`);
    } catch (error: any) {
      if (error?.$metadata?.httpStatusCode === 404) {
        this.logger.warn(
          `Bucket "${bucketName}" does not exist. Creating automatically...`,
        );
        await this.client.send(new CreateBucketCommand({ Bucket: bucketName }));
        this.logger.log(`Bucket "${bucketName}" created successfully`);
      } else {
        this.logger.error(`Error verifying bucket ${bucketName}`, error);
        throw error;
      }
    }
  }
}
