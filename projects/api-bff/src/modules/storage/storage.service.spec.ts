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

  describe('generateUploadUrl', () => {
    it('should return a signed upload URL containing the file name', async () => {
      const fileName = 'upload target.mp4';

      const url = await service.generateUploadUrl(fileName);

      expect(url.startsWith('http://localhost/upload/')).toBe(true);
      expect(url).toContain(encodeURIComponent(fileName));
    });
  });
});
