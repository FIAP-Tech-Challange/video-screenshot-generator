export interface IStorageClient {
  /**
   * Generates a signed URL for uploading a file directly to storage
   * @param fileName - The file name that will be uploaded
   * @returns Promise resolving to a signed upload URL string
   */
  generateUploadUrl(fileName: string): Promise<string>;

  /**
   * Generates a signed URL for downloading a file directly from storage
   * @param fileName - The file name that will be downloaded
   * @returns Promise resolving to a signed download URL string
   */
  generateDownloadUrl(fileName: string): Promise<string>;
}
