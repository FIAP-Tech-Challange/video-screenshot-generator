import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { StorageService } from './storage.service';
import * as Minio from 'minio';

jest.mock('minio');

describe('StorageService', () => {
  let service: StorageService;
  let configService: ConfigService;
  let mockMinioClient: jest.Mocked<Minio.Client>;

  const mockConfig = {
    MINIO_ENDPOINT: 'localhost',
    MINIO_PORT: 9000,
    MINIO_ACCESS_KEY: 'test-access-key',
    MINIO_SECRET_KEY: 'test-secret-key',
    SRC_BUCKET_NAME: 'test-bucket',
  };

  beforeEach(async () => {
    mockMinioClient = {
      presignedPutObject: jest.fn(),
    } as any;

    (Minio.Client as jest.MockedClass<typeof Minio.Client>).mockImplementation(
      () => mockMinioClient,
    );

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StorageService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => mockConfig[key]),
          },
        },
      ],
    }).compile();

    service = module.get<StorageService>(StorageService);
    configService = module.get<ConfigService>(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('onModuleInit', () => {
    it('should initialize MinIO client with correct config', async () => {
      await service.onModuleInit();

      expect(Minio.Client).toHaveBeenCalledWith({
        endPoint: 'localhost',
        port: 9000,
        useSSL: false,
        accessKey: 'test-access-key',
        secretKey: 'test-secret-key',
      });
    });

    it('should retrieve bucket name from config', async () => {
      await service.onModuleInit();

      expect(configService.get).toHaveBeenCalledWith('MINIO_BUCKET_NAME', {
        infer: true,
      });
    });
  });

  describe('generateUploadUrl', () => {
    beforeEach(async () => {
      await service.onModuleInit();
    });

    it('should generate a signed upload URL', async () => {
      const mockUrl =
        'http://localhost:9000/test-bucket/test-file.mp4?signature=xyz';
      mockMinioClient.presignedPutObject.mockResolvedValue(mockUrl);

      const result = await service.generateUploadUrl('test-file.mp4');

      expect(result).toBe(mockUrl);
      expect(mockMinioClient.presignedPutObject).toHaveBeenCalledWith(
        'test-bucket',
        'test-file.mp4',
        3600,
      );
    });

    it('should use 1 hour expiry time', async () => {
      const mockUrl =
        'http://localhost:9000/test-bucket/video.mp4?signature=abc';
      mockMinioClient.presignedPutObject.mockResolvedValue(mockUrl);

      await service.generateUploadUrl('video.mp4');

      expect(mockMinioClient.presignedPutObject).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
        3600,
      );
    });

    it('should throw error if MinIO client fails', async () => {
      mockMinioClient.presignedPutObject.mockRejectedValue(
        new Error('MinIO error'),
      );

      await expect(service.generateUploadUrl('file.mp4')).rejects.toThrow(
        'MinIO error',
      );
    });
  });
});
