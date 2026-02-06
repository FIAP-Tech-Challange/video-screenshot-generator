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
import { randomUUID } from 'crypto';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegStatic from 'ffmpeg-static';
import ffprobeStatic from 'ffprobe-static';
import archiver from 'archiver';
import { createWriteStream, promises as fs } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { Readable } from 'stream';

@Injectable()
export class BucketService {
  private readonly logger = new Logger(BucketService.name);
  private bucket: S3Client;
  private readonly bucketVideoName: string;
  private readonly bucketScreenshotName: string;

  constructor(private readonly configService: ConfigService) {
    this.bucketVideoName =
      this.configService.getOrThrow<string>('BUCKET_VIDEO_NAME');
    this.bucketScreenshotName = this.configService.getOrThrow<string>(
      'BUCKET_SCREENSHOT_NAME',
    );

    this.bucket = new S3Client({
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

    if (ffmpegStatic) {
      ffmpeg.setFfmpegPath(ffmpegStatic as unknown as string);
    }
    if (ffprobeStatic.path) {
      ffmpeg.setFfprobePath(ffprobeStatic.path);
    }
  }

  async onModuleInit() {
    try {
      await this.checkConnection();
      await this.ensureBucketsExist();
    } catch (error) {
      this.logger.error('Failed to initialize bucket ', error);
      void this.retryConnection();
    }
  }

  public async getPresignedUploadUrl(contentType?: string) {
    try {
      const key = this.createPathAndName(this.bucketVideoName, 'mp4');
      const command = new PutObjectCommand({
        Bucket: this.bucketVideoName,
        Key: key.name,
        ContentType: contentType || 'video/mp4',
      });

      const url = await getSignedUrl(this.bucket, command, { expiresIn: 3600 });
      this.logger.log(`Generated pre-signed upload URL for ${key.name}`);
      return { url, key: key.name };
    } catch (error) {
      this.logger.error('Failed to generate pre-signed upload URL', error);
      throw error;
    }
  }

  public async uploadScreenshot(buffer: Buffer) {
    try {
      const pathInfo = this.createPathAndName(this.bucketScreenshotName, 'jpg');

      await this.bucket.send(
        new PutObjectCommand({
          Bucket: this.bucketScreenshotName,
          Key: pathInfo.name,
          Body: buffer,
          ContentType: 'image/jpeg',
        }),
      );

      this.logger.log(`Screenshot "${pathInfo.name}" uploaded successfully`);
      return pathInfo;
    } catch (error) {
      this.logger.error('Failed to upload screenshot', error);
      throw error;
    }
  }

  public async getPresignedDownloadUrl(key: string) {
    try {
      this.logger.log(`Generating pre-signed download URL for ${key}`);
      const command = new GetObjectCommand({
        Bucket: this.bucketScreenshotName,
        Key: key,
      });
      const url = await getSignedUrl(this.bucket, command, { expiresIn: 3600 });
      this.logger.log(`Generated pre-signed download URL for ${key}`);
      return { url, expiresIn: 3600 };
    } catch (error) {
      this.logger.error('Failed to generate pre-signed download URL', error);
      throw error;
    }
  }

  private async checkConnection() {
    await this.bucket.send(new ListBucketsCommand({}));
    this.logger.log('Connection with bucket established successfully');
  }

  private async ensureBucketsExist() {
    const buckets = [this.bucketVideoName, this.bucketScreenshotName];

    for (const bucketName of buckets) {
      try {
        await this.bucket.send(new HeadBucketCommand({ Bucket: bucketName }));
        this.logger.log(`Bucket "${bucketName}" already exists`);
      } catch (error: any) {
        if (error?.$metadata?.httpStatusCode === 404) {
          this.logger.warn(
            `Bucket "${bucketName}" does not exist. Creating automatically...`,
          );
          await this.bucket.send(
            new CreateBucketCommand({ Bucket: bucketName }),
          );
          this.logger.log(`Bucket "${bucketName}" created successfully`);
        } else {
          this.logger.error(`Error verifying bucket ${bucketName}`, error);
          throw error;
        }
      }
    }
  }

  private async retryConnection(maxRetries = 10) {
    let attempt = 0;
    while (attempt < maxRetries) {
      try {
        attempt++;
        await this.checkConnection();
        await this.ensureBucketsExist();
        this.logger.log('Bucket connected successfully');
        return;
      } catch (error) {
        const delay = Math.min(1000 * 2 ** attempt, 15000);
        this.logger.error(
          `Bucket connection attempt ${attempt} failed. Retrying in ${delay / 1000}s`,
          error,
        );
        await this.sleep(delay);
      }
    }
    this.logger.error('Bucket connection failed after multiple attempts.');
  }

  private async sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private createPathAndName(
    bucket: string,
    extension: string,
  ): { path: string; name: string } {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const uuid = randomUUID();

    const key = `${year}/${month}/${day}/${uuid}.${extension}`;

    return {
      path: `${bucket}/${key}`,
      name: key,
    };
  }

  public async generateAndSaveScreenshots(videoKey: string) {
    const tempDir = join(tmpdir(), `screenshots-${randomUUID()}`);
    const videoPath = join(tempDir, 'video.mp4');
    const screenshotsDir = join(tempDir, 'screenshots');
    const zipPath = join(tempDir, 'screenshots.zip');

    try {
      this.logger.log(`Starting screenshot generation for video: ${videoKey}`);

      await fs.mkdir(tempDir, { recursive: true });
      await fs.mkdir(screenshotsDir, { recursive: true });

      this.logger.log('Downloading video from bucket...');
      const getObjectCommand = new GetObjectCommand({
        Bucket: this.bucketVideoName,
        Key: videoKey,
      });

      const response = await this.bucket.send(getObjectCommand);
      const videoStream = response.Body as Readable;
      const fileStream = createWriteStream(videoPath);

      await new Promise<void>((resolve, reject) => {
        fileStream.on('finish', () => {
          this.logger.log('Video stream finished writing');
          resolve();
        });
        fileStream.on('error', (err) => {
          this.logger.error('Error writing video file', err);
          reject(err);
        });
        videoStream.on('error', (err) => {
          this.logger.error('Error reading video stream', err);
          reject(err);
        });

        videoStream.pipe(fileStream);
      });

      const stats = await fs.stat(videoPath);
      if (stats.size === 0) {
        throw new Error('Downloaded video file is empty');
      }
      this.logger.log('Video downloaded successfully');

      this.logger.log('Generating screenshots...');
      await this.generateScreenshots(videoPath, screenshotsDir);

      this.logger.log('Creating zip file...');
      await this.createZipFile(screenshotsDir, zipPath);

      this.logger.log('Uploading zip to bucket...');
      const zipBuffer = await fs.readFile(zipPath);
      const pathInfo = this.createPathAndName(this.bucketScreenshotName, 'zip');

      await this.bucket.send(
        new PutObjectCommand({
          Bucket: this.bucketScreenshotName,
          Key: pathInfo.name,
          Body: zipBuffer,
          ContentType: 'application/zip',
        }),
      );

      this.logger.log(
        `Screenshots zip uploaded successfully: ${pathInfo.name}`,
      );

      return {
        message: 'Screenshots generated and uploaded successfully',
        path: pathInfo.path,
        key: pathInfo.name,
      };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error('Failed to generate screenshots', errorMessage);
      throw error;
    } finally {
      try {
        await fs.rm(tempDir, { recursive: true, force: true });
        this.logger.log('Temporary files cleaned up');
      } catch (cleanupError) {
        this.logger.warn('Failed to clean up temporary files', cleanupError);
      }
    }
  }

  private async generateScreenshots(
    videoPath: string,
    outputDir: string,
    count?: number,
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      ffmpeg(videoPath)
        .on('end', () => {
          this.logger.log('Screenshot generation completed');
          resolve();
        })
        .on('error', (err: Error) => {
          this.logger.error('FFmpeg error', err);
          reject(err);
        })
        .screenshots({
          count: count && count > 0 && count < 20 ? count : 10,
          folder: outputDir,
          filename: 'screenshot-%i.jpg',
          size: '1280x720',
        });
    });
  }

  private async createZipFile(
    sourceDir: string,
    outputPath: string,
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const output = createWriteStream(outputPath);
      const archive = archiver('zip', { zlib: { level: 9 } });

      output.on('close', () => {
        this.logger.log(`Zip file created: ${archive.pointer()} bytes`);
        resolve();
      });

      archive.on('error', (err: Error) => {
        this.logger.error('Archiver error', err);
        reject(err);
      });

      archive.pipe(output);
      archive.directory(sourceDir, false);
      void archive.finalize();
    });
  }
}
