export interface FileStoragePort {
  uploadFile(
    bucket: string,
    key: string,
    body: Buffer,
    contentType: string,
  ): Promise<void>;
  downloadFile(bucket: string, key: string): Promise<NodeJS.ReadableStream>;
  checkConnection(): Promise<void>;
  ensureBucketExists(bucket: string): Promise<void>;
}
