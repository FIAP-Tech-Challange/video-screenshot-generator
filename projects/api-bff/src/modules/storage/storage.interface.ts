export interface IStorageClient {
  /**
   * Generates a presigned URL for uploading a file
   * @param fileName - The name of the file to upload
   * @returns A presigned URL that can be used to upload the file
   */
  generateUploadUrl(fileName: string): Promise<string>;

  /**
   * Generates a presigned URL for downloading a file
   * @param fileName - The name of the file to download
   * @returns A presigned URL that can be used to download the file
   */
  generateDownloadUrl(fileName: string): Promise<string>;
}
