import { ConfigService } from '@nestjs/config';
import { MinIoStorageClient } from './minio-storage-client';

const mockGetSignedUrl = jest.fn();

jest.mock('@aws-sdk/s3-request-presigner', () => ({
  getSignedUrl: (...args: unknown[]) => mockGetSignedUrl(...args),
}));

jest.mock('@aws-sdk/client-s3', () => ({
  S3Client: jest.fn().mockImplementation(() => ({})),
  PutObjectCommand: jest.fn().mockImplementation((input) => ({ input })),
  GetObjectCommand: jest.fn().mockImplementation((input) => ({ input })),
}));

const mockConfigService = {
  getOrThrow: jest.fn((key: string) => {
    const config: Record<string, string> = {
      MINIO_URL: 'http://minio:9000',
      MINIO_PUBLIC_URL: 'http://localhost:9000',
      MINIO_ACCESS_KEY: 'accesskey',
      MINIO_SECRET_KEY: 'secretkey',
      BUCKET_REGION: 'us-east-1',
    };
    return config[key];
  }),
} as unknown as ConfigService;

describe('MinIoStorageClient', () => {
  let client: MinIoStorageClient;

  beforeEach(() => {
    jest.clearAllMocks();
    client = new MinIoStorageClient(mockConfigService);
  });

  describe('generateUploadUrl', () => {
    it('should return the signed upload URL', async () => {
      const expectedUrl = 'https://minio/signed-upload-url';
      mockGetSignedUrl.mockResolvedValue(expectedUrl);

      const result = await client.generateUploadUrl(
        'videos',
        'job-1.mp4',
        3600,
      );

      expect(mockGetSignedUrl).toHaveBeenCalledTimes(1);
      expect(result).toBe(expectedUrl);
    });

    it('should throw a descriptive error when signing fails', async () => {
      mockGetSignedUrl.mockRejectedValue(new Error('signing failed'));

      await expect(
        client.generateUploadUrl('videos', 'job-1.mp4', 3600),
      ).rejects.toThrow(
        'Failed to generate upload URL for "job-1.mp4": signing failed',
      );
    });

    it('should wrap non-Error rejections in a descriptive error', async () => {
      mockGetSignedUrl.mockRejectedValue('unexpected');

      await expect(
        client.generateUploadUrl('videos', 'job-1.mp4', 3600),
      ).rejects.toThrow(
        'Failed to generate upload URL for "job-1.mp4": unexpected',
      );
    });
  });

  describe('generateDownloadUrl', () => {
    it('should return the signed download URL', async () => {
      const expectedUrl = 'https://minio/signed-download-url';
      mockGetSignedUrl.mockResolvedValue(expectedUrl);

      const result = await client.generateDownloadUrl(
        'screenshots',
        'job-1.zip',
        3600,
      );

      expect(mockGetSignedUrl).toHaveBeenCalledTimes(1);
      expect(result).toBe(expectedUrl);
    });

    it('should throw a descriptive error when signing fails', async () => {
      mockGetSignedUrl.mockRejectedValue(new Error('network error'));

      await expect(
        client.generateDownloadUrl('screenshots', 'job-1.zip', 3600),
      ).rejects.toThrow(
        'Failed to generate download URL for "job-1.zip": network error',
      );
    });

    it('should wrap non-Error rejections in a descriptive error', async () => {
      mockGetSignedUrl.mockRejectedValue('unexpected');

      await expect(
        client.generateDownloadUrl('screenshots', 'job-1.zip', 3600),
      ).rejects.toThrow(
        'Failed to generate download URL for "job-1.zip": unexpected',
      );
    });
  });
});
