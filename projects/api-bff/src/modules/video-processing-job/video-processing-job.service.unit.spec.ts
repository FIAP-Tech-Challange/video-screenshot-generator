import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { VideoProcessingJobService } from './video-processing-job.service';
import {
  VideoProcessingJob,
  VideoProcessingJobStatus,
} from './video-processing-job.entity';
import { ConfigService } from '@nestjs/config';

describe('VideoProcessingJobService - Unit', () => {
  let service: VideoProcessingJobService;

  const mockRepo = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
  };

  const VIDEO_BUCKET = 'videos-bucket';
  const SCREENSHOT_BUCKET = 'screens-bucket';

  const configMock = {
    getOrThrow: jest.fn((key: string) => {
      if (key === 'BUCKET_VIDEO_NAME') return VIDEO_BUCKET;
      if (key === 'BUCKET_SCREENSHOT_NAME') return SCREENSHOT_BUCKET;
      throw new Error(`Missing config ${key}`);
    }),
  };

  // simple storage mock: no real network, just record calls and return deterministic url
  const storageMock = {
    generateUploadUrl: jest.fn(async (bucket: string, key: string) => {
      return Promise.resolve(
        `mock://upload/${encodeURIComponent(bucket)}/${encodeURIComponent(key)}`,
      );
    }),
    generateDownloadUrl: jest.fn(async (bucket: string, key: string) => {
      return Promise.resolve(
        `mock://download/${encodeURIComponent(bucket)}/${encodeURIComponent(key)}`,
      );
    }),
  };

  beforeEach(async () => {
    mockRepo.create.mockClear();
    mockRepo.save.mockClear();
    mockRepo.findOne.mockClear();
    (configMock.getOrThrow as jest.Mock).mockClear();
    storageMock.generateUploadUrl.mockClear();
    storageMock.generateDownloadUrl.mockClear();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VideoProcessingJobService,
        { provide: getRepositoryToken(VideoProcessingJob), useValue: mockRepo },
        { provide: 'IStorageClient', useValue: storageMock },
        { provide: ConfigService, useValue: configMock },
      ],
    }).compile();

    service = module.get<VideoProcessingJobService>(VideoProcessingJobService);
  });

  describe('create', () => {
    it('should create and save job and request upload URL with jobId.mp4 in video bucket', async () => {
      const fakeJob = {
        id: 'job-1',
        userId: 'user-x',
        fileName: 'video.mp4',
        status: VideoProcessingJobStatus.QUEUED,
      } as VideoProcessingJob;

      mockRepo.create.mockReturnValue(fakeJob);
      mockRepo.save.mockResolvedValue(fakeJob);

      const result = await service.create(fakeJob.userId, fakeJob.fileName);

      // repository interactions
      expect(mockRepo.create).toHaveBeenCalledWith({
        userId: fakeJob.userId,
        fileName: fakeJob.fileName,
        status: VideoProcessingJobStatus.QUEUED,
      });
      expect(mockRepo.save).toHaveBeenCalledWith(fakeJob);

      // storage call should use video bucket and jobId.mp4 key with 1 hour expiry
      expect(storageMock.generateUploadUrl).toHaveBeenCalledWith(
        VIDEO_BUCKET,
        `${fakeJob.id}.mp4`,
        60 * 60,
      );

      // result should include job and the mocked upload url
      expect(result.job).toBe(fakeJob);
      expect(result.uploadUrl).toBe(
        `mock://upload/${encodeURIComponent(VIDEO_BUCKET)}/${encodeURIComponent(
          `${fakeJob.id}.mp4`,
        )}`,
      );
    });
  });

  describe('getJobById', () => {
    it('should call repository.findOne with the correct where clause and return the job when found', async () => {
      const job = {
        id: 'j-10',
        userId: 'user-10',
        status: VideoProcessingJobStatus.QUEUED,
      } as VideoProcessingJob;

      mockRepo.findOne.mockResolvedValue(job);

      const result = await service.getJobById(job.userId, job.id);

      expect(mockRepo.findOne).toHaveBeenCalledWith({
        where: { id: job.id, userId: job.userId },
      });
      expect(result).toBe(job);
    });

    it('should throw when job is not found', async () => {
      mockRepo.findOne.mockResolvedValue(undefined);

      await expect(service.getJobById('u', 'missing')).rejects.toThrow(
        'Job not found',
      );
    });
  });

  describe('getScreenshotsDownloadUrl', () => {
    it('should throw when job is not SUCCESS', async () => {
      const job = {
        id: 'j-zip',
        userId: 'u-1',
        status: VideoProcessingJobStatus.QUEUED,
      } as VideoProcessingJob;

      mockRepo.findOne.mockResolvedValue(job);

      await expect(
        service.getScreenshotsDownloadUrl(job.userId, job.id),
      ).rejects.toThrow('Job is not on success status');

      // ensure we did query the repo
      expect(mockRepo.findOne).toHaveBeenCalledWith({
        where: { id: job.id, userId: job.userId },
      });
      // storage should not be called
      expect(storageMock.generateDownloadUrl).not.toHaveBeenCalled();
    });

    it('should call storage.generateDownloadUrl with screenshots bucket and jobId.zip when job is SUCCESS', async () => {
      const job = {
        id: 'j-zip-success',
        userId: 'u-2',
        status: VideoProcessingJobStatus.SUCCESS,
      } as VideoProcessingJob;

      mockRepo.findOne.mockResolvedValue(job);

      const url = await service.getScreenshotsDownloadUrl(job.userId, job.id);

      expect(mockRepo.findOne).toHaveBeenCalledWith({
        where: { id: job.id, userId: job.userId },
      });

      expect(storageMock.generateDownloadUrl).toHaveBeenCalledWith(
        SCREENSHOT_BUCKET,
        `${job.id}.zip`,
        60 * 60,
      );

      expect(url).toBe(
        `mock://download/${encodeURIComponent(SCREENSHOT_BUCKET)}/${encodeURIComponent(
          `${job.id}.zip`,
        )}`,
      );
    });
  });

  describe('direct helpers', () => {
    it('getUploadUrlForVideo should call storage with .mp4 key in video bucket', async () => {
      const spy = jest.spyOn(storageMock, 'generateUploadUrl');
      const url = await service.getUploadUrlForVideo('some-id');

      expect(spy).toHaveBeenCalledWith(VIDEO_BUCKET, 'some-id.mp4', 60 * 60);
      expect(url).toBe(
        `mock://upload/${encodeURIComponent(VIDEO_BUCKET)}/${encodeURIComponent(
          'some-id.mp4',
        )}`,
      );
    });

    it('getDownloadUrlForScreenshots should call storage with .zip key in screenshot bucket', async () => {
      const spy = jest.spyOn(storageMock, 'generateDownloadUrl');
      const url = await service.getDownloadUrlForScreenshots('another-id');

      expect(spy).toHaveBeenCalledWith(
        SCREENSHOT_BUCKET,
        'another-id.zip',
        60 * 60,
      );
      expect(url).toBe(
        `mock://download/${encodeURIComponent(SCREENSHOT_BUCKET)}/${encodeURIComponent(
          'another-id.zip',
        )}`,
      );
    });
  });
});
