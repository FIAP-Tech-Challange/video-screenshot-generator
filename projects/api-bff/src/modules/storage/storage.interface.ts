export interface IStorageClient {
  /**
   * Generates a signed URL for uploading a file directly to storage
   * @param fileName - The file name that will be uploaded
   * @returns Promise resolving to a signed upload URL string
   */
  generateUploadUrl(fileName: string): Promise<string>;
}
