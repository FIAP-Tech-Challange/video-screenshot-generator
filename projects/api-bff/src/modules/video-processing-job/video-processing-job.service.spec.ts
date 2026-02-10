import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { VideoProcessingJobService } from './video-processing-job.service';
import {
  VideoProcessingJob,
  VideoProcessingJobStatus,
} from './video-processing-job.entity';
import { StorageLocalService } from '../storage/storage-local.service';
import type { IStorageClient } from '../storage/storage.interface';

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
  });

  describe('create', () => {
    const userId = 'user-123';
    const fileName = 'video.mp4';

    it('should create a video processing job and return a signed upload URL', async () => {
      const mockJob = {
        id: 'job-123',
        userId,
        fileName,
        status: VideoProcessingJobStatus.QUEUED,
        errorReason: null,
        createdAt: new Date(),
        processedAt: null,
      };

      mockRepository.create.mockReturnValue(mockJob);
      mockRepository.save.mockResolvedValue(mockJob);

      const result = await service.create(userId, fileName);

      expect(mockRepository.create).toHaveBeenCalledWith({
        userId,
        fileName,
        status: VideoProcessingJobStatus.QUEUED,
      });
      expect(mockRepository.save).toHaveBeenCalledWith(mockJob);
      expect(result.job).toEqual(mockJob);

      const expectedKey = `${userId}/${mockJob.id}/${fileName}`;
      expect(result.uploadUrl).toBe(
        `http://localhost/upload/${encodeURIComponent(expectedKey)}`,
      );
    });

    it('should request the signed URL using the composed object key', async () => {
      const mockJob = {
        id: 'job-456',
        userId,
        fileName,
        status: VideoProcessingJobStatus.QUEUED,
        errorReason: null,
        createdAt: new Date(),
        processedAt: null,
      };

      mockRepository.create.mockReturnValue(mockJob);
      mockRepository.save.mockResolvedValue(mockJob);

      const generateUploadUrlSpy = jest.spyOn(
        storageService,
        'generateUploadUrl',
      );

      await service.create(userId, fileName);

      expect(generateUploadUrlSpy).toHaveBeenCalledWith(
        `${userId}/${mockJob.id}/${fileName}`,
      );
    });

    it('should handle different user IDs and file names', async () => {
      const firstJob = {
        id: 'job-1',
        userId: 'user-aaa',
        fileName: 'first.mp4',
        status: VideoProcessingJobStatus.QUEUED,
        errorReason: null,
        createdAt: new Date(),
        processedAt: null,
      };

      const secondJob = {
        id: 'job-2',
        userId: 'user-bbb',
        fileName: 'second.mov',
        status: VideoProcessingJobStatus.QUEUED,
        errorReason: null,
        createdAt: new Date(),
        processedAt: null,
      };

      mockRepository.create
        .mockReturnValueOnce(firstJob)
        .mockReturnValueOnce(secondJob);
      mockRepository.save
        .mockResolvedValueOnce(firstJob)
        .mockResolvedValueOnce(secondJob);

      const firstResult = await service.create(
        firstJob.userId,
        firstJob.fileName,
      );
      const secondResult = await service.create(
        secondJob.userId,
        secondJob.fileName,
      );

      expect(firstResult.job).toEqual(firstJob);
      expect(secondResult.job).toEqual(secondJob);

      expect(firstResult.uploadUrl).toBe(
        `http://localhost/upload/${encodeURIComponent(
          `${firstJob.userId}/${firstJob.id}/${firstJob.fileName}`,
        )}`,
      );
      expect(secondResult.uploadUrl).toBe(
        `http://localhost/upload/${encodeURIComponent(
          `${secondJob.userId}/${secondJob.id}/${secondJob.fileName}`,
        )}`,
      );
    });
  });
});
