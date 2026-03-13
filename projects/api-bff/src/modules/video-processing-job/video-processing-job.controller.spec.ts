import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { VideoProcessingJobController } from './video-processing-job.controller';
import { VideoProcessingJobService } from './video-processing-job.service';
import {
  VideoProcessingJob,
  VideoProcessingJobStatus,
} from './video-processing-job.entity';

const mockService = {
  findByUserId: jest.fn(),
  create: jest.fn(),
  getScreenshotsDownloadUrl: jest.fn(),
};

describe('VideoProcessingJobController', () => {
  let controller: VideoProcessingJobController;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [VideoProcessingJobController],
      providers: [
        { provide: VideoProcessingJobService, useValue: mockService },
      ],
    }).compile();

    controller = module.get<VideoProcessingJobController>(
      VideoProcessingJobController,
    );
  });

  describe('list', () => {
    it('should return the jobs for the given userId', async () => {
      const jobs = [
        { id: 'j-1', userId: 'u-1', status: VideoProcessingJobStatus.QUEUED },
      ] as VideoProcessingJob[];
      mockService.findByUserId.mockResolvedValue(jobs);

      const result = await controller.list('u-1');

      expect(mockService.findByUserId).toHaveBeenCalledWith('u-1');
      expect(result).toEqual(jobs);
    });

    it('should return an empty array when user has no jobs', async () => {
      mockService.findByUserId.mockResolvedValue([]);

      const result = await controller.list('u-1');

      expect(result).toEqual([]);
    });
  });

  describe('create', () => {
    it('should create a job and return it with the upload URL', async () => {
      const job = {
        id: 'j-1',
        userId: 'u-1',
        fileName: 'video.mp4',
        status: VideoProcessingJobStatus.QUEUED,
      } as VideoProcessingJob;
      const uploadUrl = 'https://minio/signed-upload';
      mockService.create.mockResolvedValue({ job, uploadUrl });

      const result = await controller.create('u-1', 'video.mp4');

      expect(mockService.create).toHaveBeenCalledWith('u-1', 'video.mp4');
      expect(result).toEqual({ job, uploadUrl });
    });

    it('should trim whitespace from fileName before delegating', async () => {
      const job = {
        id: 'j-1',
        userId: 'u-1',
        fileName: 'video.mp4',
        status: VideoProcessingJobStatus.QUEUED,
      } as VideoProcessingJob;
      mockService.create.mockResolvedValue({ job, uploadUrl: 'https://url' });

      await controller.create('u-1', '  video.mp4  ');

      expect(mockService.create).toHaveBeenCalledWith('u-1', 'video.mp4');
    });

    it('should throw BadRequestException when fileName is empty', async () => {
      await expect(controller.create('u-1', '')).rejects.toThrow(
        BadRequestException,
      );
      await expect(controller.create('u-1', '')).rejects.toThrow(
        'fileName is required',
      );
      expect(mockService.create).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when fileName is only whitespace', async () => {
      await expect(controller.create('u-1', '   ')).rejects.toThrow(
        BadRequestException,
      );
      expect(mockService.create).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when fileName is not a string', async () => {
      await expect(
        controller.create('u-1', undefined as unknown as string),
      ).rejects.toThrow(BadRequestException);
      expect(mockService.create).not.toHaveBeenCalled();
    });
  });

  describe('getScreenshotsDownloadUrl', () => {
    it('should return the download URL for a completed job', async () => {
      const downloadUrl = 'https://minio/signed-download';
      mockService.getScreenshotsDownloadUrl.mockResolvedValue(downloadUrl);

      const result = await controller.getScreenshotsDownloadUrl('u-1', 'j-1');

      expect(mockService.getScreenshotsDownloadUrl).toHaveBeenCalledWith(
        'u-1',
        'j-1',
      );
      expect(result).toEqual({ downloadUrl });
    });

    it('should propagate error when job is not in SUCCESS status', async () => {
      mockService.getScreenshotsDownloadUrl.mockRejectedValue(
        new Error('Job is not on success status'),
      );

      await expect(
        controller.getScreenshotsDownloadUrl('u-1', 'j-1'),
      ).rejects.toThrow('Job is not on success status');
    });

    it('should propagate error when job is not found', async () => {
      mockService.getScreenshotsDownloadUrl.mockRejectedValue(
        new Error('Job not found'),
      );

      await expect(
        controller.getScreenshotsDownloadUrl('u-1', 'missing-job'),
      ).rejects.toThrow('Job not found');
    });
  });
});
