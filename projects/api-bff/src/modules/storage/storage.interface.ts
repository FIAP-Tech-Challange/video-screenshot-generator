export interface IStorageClient {
  /**
   * Uploads a file directly from a buffer
   * @param fileName - The name of the file to upload
   * @param buffer - The file content as a buffer
   * @returns Promise that resolves when upload is complete
   */
  putObject(fileName: string, buffer: Buffer): Promise<void>;
}
