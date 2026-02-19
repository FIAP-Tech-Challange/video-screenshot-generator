export interface FileStoragePort {
  getPresignedUploadUrl(
    bucket: string,
    key: string,
    contentType: string,
    expiresIn?: number,
  ): Promise<string>;
  getPresignedDownloadUrl(
    bucket: string,
    key: string,
    expiresIn?: number,
  ): Promise<string>;
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
