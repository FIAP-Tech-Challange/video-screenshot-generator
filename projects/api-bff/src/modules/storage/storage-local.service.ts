import { Injectable } from '@nestjs/common';
import type { IStorageClient } from './storage.interface';

@Injectable()
export class StorageLocalService implements IStorageClient {
  private readonly baseUrl = 'http://localhost:9000';
  private uploadUrls = new Map<string, string>();
  private downloadUrls = new Map<string, string>();

  async generateUploadUrl(fileName: string): Promise<string> {
    const url = `${this.baseUrl}/uploads/${fileName}?signature=mock-upload-${Date.now()}`;
    this.uploadUrls.set(fileName, url);
    return url;
  }

  async generateDownloadUrl(fileName: string): Promise<string> {
    const url = `${this.baseUrl}/downloads/${fileName}?signature=mock-download-${Date.now()}`;
    this.downloadUrls.set(fileName, url);
    return url;
  }

  // Test helper methods
  getGeneratedUploadUrls(): Map<string, string> {
    return new Map(this.uploadUrls);
  }

  getGeneratedDownloadUrls(): Map<string, string> {
    return new Map(this.downloadUrls);
  }

  clear(): void {
    this.uploadUrls.clear();
    this.downloadUrls.clear();
  }
}
