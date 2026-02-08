import { Test, TestingModule } from '@nestjs/testing';
import { StorageLocalService } from './storage-local.service';
import type { IStorageClient } from './storage.interface';

describe('StorageService', () => {
  let service: IStorageClient;
  let localService: StorageLocalService;

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
    localService = service as StorageLocalService;
  });

  afterEach(() => {
    if (service instanceof StorageLocalService) {
      service.clear();
    }
  });

  describe('putObject', () => {
    it('should upload a file from buffer', async () => {
      const fileName = 'test-file.mp4';
      const buffer = Buffer.from('test content');

      await service.putObject(fileName, buffer);

      const uploadedFiles = localService.getUploadedFiles();
      expect(uploadedFiles.has(fileName)).toBe(true);
      expect(uploadedFiles.get(fileName)).toEqual(buffer);
    });

    it('should upload multiple files', async () => {
      const file1 = 'file1.mp4';
      const file2 = 'file2.mp4';
      const buffer1 = Buffer.from('content 1');
      const buffer2 = Buffer.from('content 2');

      await service.putObject(file1, buffer1);
      await service.putObject(file2, buffer2);

      const uploadedFiles = localService.getUploadedFiles();
      expect(uploadedFiles.size).toBe(2);
      expect(uploadedFiles.get(file1)).toEqual(buffer1);
      expect(uploadedFiles.get(file2)).toEqual(buffer2);
    });

    it('should overwrite file if same name is used', async () => {
      const fileName = 'video.mp4';
      const buffer1 = Buffer.from('original content');
      const buffer2 = Buffer.from('updated content');

      await service.putObject(fileName, buffer1);
      await service.putObject(fileName, buffer2);

      const uploadedFiles = localService.getUploadedFiles();
      expect(uploadedFiles.size).toBe(1);
      expect(uploadedFiles.get(fileName)).toEqual(buffer2);
    });

    it('should handle empty buffer', async () => {
      const fileName = 'empty.txt';
      const buffer = Buffer.from('');

      await service.putObject(fileName, buffer);

      const uploadedFiles = localService.getUploadedFiles();
      expect(uploadedFiles.has(fileName)).toBe(true);
      expect(uploadedFiles.get(fileName)?.length).toBe(0);
    });
  });

  describe('clear', () => {
    it('should clear all uploaded files', async () => {
      await service.putObject('file1.mp4', Buffer.from('content 1'));
      await service.putObject('file2.mp4', Buffer.from('content 2'));

      localService.clear();

      const uploadedFiles = localService.getUploadedFiles();
      expect(uploadedFiles.size).toBe(0);
    });
  });
});
