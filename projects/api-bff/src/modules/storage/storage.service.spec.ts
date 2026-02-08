import { Test, TestingModule } from '@nestjs/testing';
import { StorageLocalService } from './storage-local.service';
import type { IStorageClient } from './storage.interface';

describe('StorageService', () => {
  let service: IStorageClient;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: 'IStorageClient',
          useClass: StorageLocalService,
        },
      ],
    }).compile();

    service = module.get<IStorageClient>('IStorageClient');
  });

  afterEach(() => {
    if (service instanceof StorageLocalService) {
      service.clear();
    }
  });

  describe('generateUploadUrl', () => {
    it('should generate a signed upload URL', async () => {
      const result = await service.generateUploadUrl('test-file.mp4');

      expect(result).toContain('test-file.mp4');
      expect(result).toContain('signature=mock-upload-');
      expect(result).toContain('/uploads/');
    });

    it('should generate unique URLs for different files', async () => {
      const url1 = await service.generateUploadUrl('file1.mp4');
      const url2 = await service.generateUploadUrl('file2.mp4');

      expect(url1).not.toBe(url2);
      expect(url1).toContain('file1.mp4');
      expect(url2).toContain('file2.mp4');
    });

    it('should generate different URLs on subsequent calls', async () => {
      const url1 = await service.generateUploadUrl('video.mp4');
      // Small delay to ensure different timestamp
      await new Promise((resolve) => setTimeout(resolve, 1));
      const url2 = await service.generateUploadUrl('video.mp4');

      expect(url1).not.toBe(url2);
    });
  });

  describe('generateDownloadUrl', () => {
    it('should generate a signed download URL', async () => {
      const result = await service.generateDownloadUrl('test-file.mp4');

      expect(result).toContain('test-file.mp4');
      expect(result).toContain('signature=mock-download-');
      expect(result).toContain('/downloads/');
    });

    it('should generate unique URLs for different files', async () => {
      const url1 = await service.generateDownloadUrl('file1.mp4');
      const url2 = await service.generateDownloadUrl('file2.mp4');

      expect(url1).not.toBe(url2);
      expect(url1).toContain('file1.mp4');
      expect(url2).toContain('file2.mp4');
    });
  });
});
