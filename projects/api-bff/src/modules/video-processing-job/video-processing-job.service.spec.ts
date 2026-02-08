import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException } from '@nestjs/common';
import { VideoProcessingJobService } from './video-processing-job.service';
import {
  VideoProcessingJob,
  VideoProcessingJobStatus,
} from './video-processing-job.entity';
import { StorageLocalService } from '../storage/storage-local.service';
import type { IStorageClient } from '../storage/storage.interface';
import type { MulterFile } from './types';

describe('VideoProcessingJobService', () => {
  let service: VideoProcessingJobService;
  let storageService: IStorageClient;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VideoProcessingJobService,
        {
          provide: getRepositoryToken(VideoProcessingJob),
          useValue: mockRepository,
        },
        {
          provide: 'IStorageClient',
          useClass: StorageLocalService,
        },
      ],
    }).compile();

    service = module.get<VideoProcessingJobService>(VideoProcessingJobService);
    storageService = module.get<IStorageClient>('IStorageClient');
  });

  afterEach(() => {
    jest.clearAllMocks();
    if (storageService instanceof StorageLocalService) {
      storageService.clear();
    }
  });

  describe('create', () => {
    const userId = 'user-123';
    const mockFile: MulterFile = {
      fieldname: 'file',
      originalname: 'video.mp4',
      encoding: '7bit',
      mimetype: 'video/mp4',
      size: 1024,
      buffer: Buffer.from('fake video content'),
    };

    it('should create a video processing job successfully', async () => {
      const mockJob = {
        id: 'job-123',
        userId,
        fileName: mockFile.originalname,
        status: VideoProcessingJobStatus.QUEUED,
        errorReason: null,
        createdAt: new Date(),
        processedAt: null,
      };

      mockRepository.create.mockReturnValue(mockJob);
      mockRepository.save.mockResolvedValue(mockJob);

      const result = await service.create(userId, mockFile);

      expect(mockRepository.create).toHaveBeenCalledWith({
        userId,
        fileName: mockFile.originalname,
        status: VideoProcessingJobStatus.QUEUED,
      });
      expect(mockRepository.save).toHaveBeenCalledWith(mockJob);
      expect(result).toEqual(mockJob);
    });

    it('should upload file to storage after creating job', async () => {
      const mockJob = {
        id: 'job-456',
        userId,
        fileName: mockFile.originalname,
        status: VideoProcessingJobStatus.QUEUED,
        errorReason: null,
        createdAt: new Date(),
        processedAt: null,
      };

      mockRepository.create.mockReturnValue(mockJob);
      mockRepository.save.mockResolvedValue(mockJob);

      await service.create(userId, mockFile);

      const uploadedFiles = (
        storageService as StorageLocalService
      ).getUploadedFiles();
      const expectedFileName = `${userId}/${mockJob.id}/${mockFile.originalname}`;

      expect(uploadedFiles.has(expectedFileName)).toBe(true);
      expect(uploadedFiles.get(expectedFileName)).toEqual(mockFile.buffer);
    });

    it('should throw BadRequestException when file is not provided', async () => {
      await expect(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        service.create(userId, undefined as any),
      ).rejects.toThrow(BadRequestException);
      await expect(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        service.create(userId, undefined as any),
      ).rejects.toThrow('File is required');

      expect(mockRepository.create).not.toHaveBeenCalled();
      expect(mockRepository.save).not.toHaveBeenCalled();
    });

    it('should create job with correct file name', async () => {
      const customFile: MulterFile = {
        ...mockFile,
        originalname: 'my-custom-video.mov',
      };

      const mockJob = {
        id: 'job-789',
        userId,
        fileName: customFile.originalname,
        status: VideoProcessingJobStatus.QUEUED,
        errorReason: null,
        createdAt: new Date(),
        processedAt: null,
      };

      mockRepository.create.mockReturnValue(mockJob);
      mockRepository.save.mockResolvedValue(mockJob);

      const result = await service.create(userId, customFile);

      expect(result.fileName).toBe('my-custom-video.mov');
      expect(mockRepository.create).toHaveBeenCalledWith({
        userId,
        fileName: 'my-custom-video.mov',
        status: VideoProcessingJobStatus.QUEUED,
      });
    });

    it('should create job with QUEUED status by default', async () => {
      const mockJob = {
        id: 'job-default',
        userId,
        fileName: mockFile.originalname,
        status: VideoProcessingJobStatus.QUEUED,
        errorReason: null,
        createdAt: new Date(),
        processedAt: null,
      };

      mockRepository.create.mockReturnValue(mockJob);
      mockRepository.save.mockResolvedValue(mockJob);

      const result = await service.create(userId, mockFile);

      expect(result.status).toBe(VideoProcessingJobStatus.QUEUED);
    });

    it('should handle different user IDs correctly', async () => {
      const userId1 = 'user-aaa';
      const userId2 = 'user-bbb';

      const mockJob1 = {
        id: 'job-1',
        userId: userId1,
        fileName: mockFile.originalname,
        status: VideoProcessingJobStatus.QUEUED,
        errorReason: null,
        createdAt: new Date(),
        processedAt: null,
      };

      const mockJob2 = {
        id: 'job-2',
        userId: userId2,
        fileName: mockFile.originalname,
        status: VideoProcessingJobStatus.QUEUED,
        errorReason: null,
        createdAt: new Date(),
        processedAt: null,
      };

      mockRepository.create
        .mockReturnValueOnce(mockJob1)
        .mockReturnValueOnce(mockJob2);
      mockRepository.save
        .mockResolvedValueOnce(mockJob1)
        .mockResolvedValueOnce(mockJob2);

      await service.create(userId1, mockFile);
      await service.create(userId2, mockFile);

      const uploadedFiles = (
        storageService as StorageLocalService
      ).getUploadedFiles();

      expect(
        uploadedFiles.has(`${userId1}/job-1/${mockFile.originalname}`),
      ).toBe(true);
      expect(
        uploadedFiles.has(`${userId2}/job-2/${mockFile.originalname}`),
      ).toBe(true);
    });

    it('should handle large files', async () => {
      const largeFile: MulterFile = {
        ...mockFile,
        size: 100 * 1024 * 1024, // 100MB
        buffer: Buffer.alloc(100 * 1024 * 1024),
      };

      const mockJob = {
        id: 'job-large',
        userId,
        fileName: largeFile.originalname,
        status: VideoProcessingJobStatus.QUEUED,
        errorReason: null,
        createdAt: new Date(),
        processedAt: null,
      };

      mockRepository.create.mockReturnValue(mockJob);
      mockRepository.save.mockResolvedValue(mockJob);

      const result = await service.create(userId, largeFile);

      expect(result).toEqual(mockJob);
      const uploadedFiles = (
        storageService as StorageLocalService
      ).getUploadedFiles();
      const expectedFileName = `${userId}/${mockJob.id}/${largeFile.originalname}`;
      expect(uploadedFiles.get(expectedFileName)?.length).toBe(
        100 * 1024 * 1024,
      );
    });

    it('should handle special characters in file names', async () => {
      const specialFile: MulterFile = {
        ...mockFile,
        originalname: 'video with spaces & special-chars_123.mp4',
      };

      const mockJob = {
        id: 'job-special',
        userId,
        fileName: specialFile.originalname,
        status: VideoProcessingJobStatus.QUEUED,
        errorReason: null,
        createdAt: new Date(),
        processedAt: null,
      };

      mockRepository.create.mockReturnValue(mockJob);
      mockRepository.save.mockResolvedValue(mockJob);

      const result = await service.create(userId, specialFile);

      expect(result.fileName).toBe('video with spaces & special-chars_123.mp4');
    });
  });
});
