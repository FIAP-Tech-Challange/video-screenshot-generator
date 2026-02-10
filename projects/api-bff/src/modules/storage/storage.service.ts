import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Minio from 'minio';
import type { AppConfig } from '../../config/validate-env';
import type { IStorageClient } from './storage.interface';

/** MinIO client exige endPoint só o host; a porta vai em port. */
function parseMinioEndpoint(endpoint: string): { host: string; port?: number } {
  const idx = endpoint.lastIndexOf(':');
  if (idx <= 0) return { host: endpoint };
  const host = endpoint.slice(0, idx);
  const port = parseInt(endpoint.slice(idx + 1), 10);
  return Number.isNaN(port) ? { host: endpoint } : { host, port };
}

@Injectable()
export class StorageService implements IStorageClient {
  private minioClient: Minio.Client;
  private srcBucketName: string;

  constructor(private readonly configService: ConfigService<AppConfig>) {
    const endpointRaw = this.configService.get('MINIO_ENDPOINT', { infer: true })!;
    const { host, port: portFromEndpoint } = parseMinioEndpoint(endpointRaw);
    const port = portFromEndpoint ?? this.configService.get('MINIO_PORT', { infer: true })!;

    this.minioClient = new Minio.Client({
      endPoint: host,
      port,
      accessKey: this.configService.get('MINIO_ACCESS_KEY', { infer: true })!,
      secretKey: this.configService.get('MINIO_SECRET_KEY', { infer: true })!,
      useSSL: false,
    });

    this.srcBucketName = this.configService.get('SRC_BUCKET_NAME', {
      infer: true,
    })!;
  }

  async putObject(fileName: string, buffer: Buffer): Promise<void> {
    await this.minioClient.putObject(this.srcBucketName, fileName, buffer);
  }
}
