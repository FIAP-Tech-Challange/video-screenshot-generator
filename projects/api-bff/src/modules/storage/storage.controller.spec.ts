import { Test, TestingModule } from '@nestjs/testing';
import { StorageController } from './storage.controller';
import { StorageService } from './storage.service';
import { JwtAuthGuard } from '../auth/jwt.guard';

describe('StorageController', () => {
  let controller: StorageController;
  let storageService: StorageService;

  const mockStorageService = {
    generateUploadUrl: jest.fn(),
  };

  const mockJwtAuthGuard = {
    canActivate: jest.fn(() => true),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StorageController],
      providers: [
        {
          provide: StorageService,
          useValue: mockStorageService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtAuthGuard)
      .compile();

    controller = module.get<StorageController>(StorageController);
    storageService = module.get<StorageService>(StorageService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('generateUploadUrl', () => {
    it('should return a signed URL for valid fileName', async () => {
      const fileName = 'test-video.mp4';
      const mockUrl =
        'http://localhost:9000/bucket/test-video.mp4?signature=xyz';

      mockStorageService.generateUploadUrl.mockResolvedValue(mockUrl);

      const result = await controller.generateUploadUrl(fileName);

      expect(result).toEqual({ url: mockUrl });
      expect(storageService.generateUploadUrl).toHaveBeenCalledWith(fileName);
      expect(storageService.generateUploadUrl).toHaveBeenCalledTimes(1);
    });

    it('should call service with correct fileName', async () => {
      const fileName = 'my-file.png';
      const mockUrl = 'http://localhost:9000/bucket/my-file.png?signature=abc';

      mockStorageService.generateUploadUrl.mockResolvedValue(mockUrl);

      await controller.generateUploadUrl(fileName);

      expect(storageService.generateUploadUrl).toHaveBeenCalledWith(fileName);
    });

    it('should throw error if service fails', async () => {
      const fileName = 'error-file.mp4';

      mockStorageService.generateUploadUrl.mockRejectedValue(
        new Error('MinIO connection failed'),
      );

      await expect(controller.generateUploadUrl(fileName)).rejects.toThrow(
        'MinIO connection failed',
      );
    });

    it('should be protected by JwtAuthGuard', () => {
      const guards = Reflect.getMetadata('__guards__', StorageController);
      expect(guards).toBeDefined();
      expect(guards).toContain(JwtAuthGuard);
    });
  });
});
