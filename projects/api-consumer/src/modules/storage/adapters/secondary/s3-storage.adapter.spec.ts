/* eslint-disable @typescript-eslint/unbound-method */
import { ConfigService } from '@nestjs/config';
import { S3Client } from '@aws-sdk/client-s3';
import { S3StorageAdapter } from './s3-storage.adapter';

jest.mock('@aws-sdk/client-s3', () => {
  const actual =
    jest.requireActual<typeof import('@aws-sdk/client-s3')>(
      '@aws-sdk/client-s3',
    );
  return {
    ...actual,
    S3Client: jest.fn().mockImplementation(() => ({
      send: jest.fn(),
    })),
  };
});

const mockConfigService = {
  getOrThrow: jest.fn((key: string) => {
    const config: Record<string, string> = {
      BUCKET_REGION: 'us-east-1',
      MINIO_URL: 'http://localhost:9000',
      MINIO_ACCESS_KEY: 'access-key',
      MINIO_SECRET_KEY: 'secret-key',
    };
    return config[key];
  }),
} as unknown as ConfigService;

describe('S3StorageAdapter', () => {
  let adapter: S3StorageAdapter;
  let mockSend: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    adapter = new S3StorageAdapter(mockConfigService);
    mockSend = (adapter['client'] as jest.Mocked<S3Client>).send as jest.Mock;
  });

  describe('uploadFile', () => {
    it('sends a PutObjectCommand with the correct parameters', async () => {
      const body = Buffer.from('video-data');
      mockSend.mockResolvedValue({});

      await adapter.uploadFile('my-bucket', 'my-key.mp4', body, 'video/mp4');

      expect(mockSend).toHaveBeenCalledTimes(1);
      const command = mockSend.mock.calls[0][0];
      expect(command.constructor.name).toBe('PutObjectCommand');
      expect(command.input).toMatchObject({
        Bucket: 'my-bucket',
        Key: 'my-key.mp4',
        Body: body,
        ContentType: 'video/mp4',
      });
    });
  });

  describe('downloadFile', () => {
    it('sends a GetObjectCommand and returns the response Body', async () => {
      const fakeStream = { pipe: jest.fn() };
      mockSend.mockResolvedValue({ Body: fakeStream });

      const result = await adapter.downloadFile('my-bucket', 'my-key.mp4');

      expect(mockSend).toHaveBeenCalledTimes(1);
      const command = mockSend.mock.calls[0][0];
      expect(command.constructor.name).toBe('GetObjectCommand');
      expect(command.input).toMatchObject({
        Bucket: 'my-bucket',
        Key: 'my-key.mp4',
      });
      expect(result).toBe(fakeStream);
    });
  });

  describe('checkConnection', () => {
    it('sends a ListBucketsCommand', async () => {
      mockSend.mockResolvedValue({});

      await adapter.checkConnection();

      expect(mockSend).toHaveBeenCalledTimes(1);
      const command = mockSend.mock.calls[0][0];
      expect(command.constructor.name).toBe('ListBucketsCommand');
    });
  });

  describe('ensureBucketExists', () => {
    it('only sends HeadBucketCommand when the bucket already exists', async () => {
      mockSend.mockResolvedValue({});

      await adapter.ensureBucketExists('my-bucket');

      expect(mockSend).toHaveBeenCalledTimes(1);
      const command = mockSend.mock.calls[0][0];
      expect(command.constructor.name).toBe('HeadBucketCommand');
    });

    it('sends CreateBucketCommand when HeadBucket returns 404', async () => {
      mockSend
        .mockRejectedValueOnce({ $metadata: { httpStatusCode: 404 } })
        .mockResolvedValueOnce({});

      await adapter.ensureBucketExists('new-bucket');

      expect(mockSend).toHaveBeenCalledTimes(2);
      expect(mockSend.mock.calls[0][0].constructor.name).toBe(
        'HeadBucketCommand',
      );
      expect(mockSend.mock.calls[1][0].constructor.name).toBe(
        'CreateBucketCommand',
      );
    });

    it('re-throws when HeadBucket fails with a non-404 error', async () => {
      const error = { $metadata: { httpStatusCode: 403 } };
      mockSend.mockRejectedValueOnce(error);

      await expect(adapter.ensureBucketExists('my-bucket')).rejects.toBe(error);
      expect(mockSend).toHaveBeenCalledTimes(1);
    });
  });
});
