export interface IStorageClient {
  /**
   * Generates a signed URL for uploading a file directly to storage
   * @param bucketName - The name of the bucket where the file will be stored
   * @param objectKey - The key (path) where the file will be stored in the bucket
   * @param expiresIn - The expiration time for the signed URL in seconds
   * @returns Promise resolving to a signed upload URL string
   */
  generateUploadUrl(
    bucketName: string,
    objectKey: string,
    expiresIn: number,
  ): Promise<string>;

  /**
   * Generates a signed URL for downloading a file directly from storage
   * @param bucketName - The name of the bucket where the file is stored
   * @param objectKey - The key (path) where the file is stored in the bucket
   * @param expiresIn - The expiration time for the signed URL in seconds
   * @returns Promise resolving to a signed download URL string
   */
  generateDownloadUrl(
    bucketName: string,
    objectKey: string,
    expiresIn: number,
  ): Promise<string>;
}
