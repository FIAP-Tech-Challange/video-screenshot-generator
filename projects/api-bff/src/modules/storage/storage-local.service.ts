import { Injectable } from '@nestjs/common';
import type { IStorageClient } from './storage.interface';

@Injectable()
export class StorageLocalService implements IStorageClient {
  private uploadedFiles = new Map<string, Buffer>();

  putObject(fileName: string, buffer: Buffer): Promise<void> {
    this.uploadedFiles.set(fileName, buffer);
    return Promise.resolve();
  }

  getUploadedFiles(): Map<string, Buffer> {
    return new Map(this.uploadedFiles);
  }

  clear(): void {
    this.uploadedFiles.clear();
  }
}
