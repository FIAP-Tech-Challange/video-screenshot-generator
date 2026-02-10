import { Injectable } from '@nestjs/common';
import type { IStorageClient } from './storage.interface';

@Injectable()
export class StorageLocalService implements IStorageClient {
  generateUploadUrl(fileName: string): Promise<string> {
    return Promise.resolve(
      `http://localhost/upload/${encodeURIComponent(fileName)}`,
    );
  }
}
