import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import { createWriteStream, promises as fs } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import archiver from 'archiver';

import type { StorageServicePort } from '../ports/input/storage.service.port';
import type { FileStoragePort } from '../ports/output/file-storage.port';
import type { VideoProcessorPort } from '../ports/output/video-processor.port';

@Injectable()
export class StorageService implements StorageServicePort, OnModuleInit {
  private readonly logger = new Logger(StorageService.name);
  private readonly bucketVideoName: string;
  private readonly bucketScreenshotName: string;

  constructor(
    private readonly configService: ConfigService,
    @Inject('FileStoragePort') private readonly fileStorage: FileStoragePort,
    @Inject('VideoProcessorPort')
    private readonly videoProcessor: VideoProcessorPort,
  ) {
    this.bucketVideoName =
      this.configService.getOrThrow<string>('BUCKET_VIDEO_NAME');
    this.bucketScreenshotName = this.configService.getOrThrow<string>(
      'BUCKET_SCREENSHOT_NAME',
    );
  }

  async onModuleInit() {
    try {
      await this.fileStorage.checkConnection();
      await this.ensureBucketsExist();
    } catch (error) {
      this.logger.error('Failed to initialize storage service ', error);
      void this.retryConnection();
    }
  }

  async getPresignedUploadUrl(contentType: string = 'video/mp4') {
    try {
      const key = this.createPathAndName(this.bucketVideoName, 'mp4');
      const url = await this.fileStorage.getPresignedUploadUrl(
        this.bucketVideoName,
        key.name,
        contentType,
      );
      this.logger.log(`Generated pre-signed upload URL for ${key.name}`);
      return { url, key: key.name };
    } catch (error) {
      this.logger.error('Failed to generate pre-signed upload URL', error);
      throw error;
    }
  }

  async getPresignedDownloadUrl(key: string) {
    try {
      this.logger.log(`Generating pre-signed download URL for ${key}`);
      const url = await this.fileStorage.getPresignedDownloadUrl(
        this.bucketScreenshotName,
        key,
      );
      this.logger.log(`Generated pre-signed download URL for ${key}`);
      return { url, expiresIn: 3600 };
    } catch (error) {
      this.logger.error('Failed to generate pre-signed download URL', error);
      throw error;
    }
  }

  async generateAndSaveScreenshots(videoKey: string, count?: number) {
    const tempUuid = randomUUID();
    const tempDir = join(tmpdir(), `screenshots-${tempUuid}`);
    const videoPath = join(tempDir, 'video.mp4');
    const screenshotsDir = join(tempDir, 'screenshots');
    const zipPath = join(tempDir, 'screenshots.zip');

    try {
      this.logger.log(`Starting screenshot generation for video: ${videoKey}`);

      await fs.mkdir(tempDir, { recursive: true });
      await fs.mkdir(screenshotsDir, { recursive: true });

      this.logger.log('Downloading video from bucket...');
      const videoStream = await this.fileStorage.downloadFile(
        this.bucketVideoName,
        videoKey,
      );
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
      await this.videoProcessor.generateScreenshots(
        videoPath,
        screenshotsDir,
        count,
      );

      this.logger.log('Creating zip file...');
      await this.createZipFile(screenshotsDir, zipPath);

      this.logger.log('Uploading zip to bucket...');
      const zipBuffer = await fs.readFile(zipPath);
      const pathInfo = this.createPathAndName(this.bucketScreenshotName, 'zip');

      await this.fileStorage.uploadFile(
        this.bucketScreenshotName,
        pathInfo.name,
        zipBuffer,
        'application/zip',
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

  private async ensureBucketsExist() {
    const buckets = [this.bucketVideoName, this.bucketScreenshotName];
    for (const bucket of buckets) {
      await this.fileStorage.ensureBucketExists(bucket);
    }
  }

  private async retryConnection(maxRetries = 10) {
    let attempt = 0;
    while (attempt < maxRetries) {
      try {
        attempt++;
        await this.fileStorage.checkConnection();
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

    const key = `${year}${month}${day}${uuid}.${extension}`;

    return {
      path: `${bucket}/${key}`,
      name: key,
    };
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
