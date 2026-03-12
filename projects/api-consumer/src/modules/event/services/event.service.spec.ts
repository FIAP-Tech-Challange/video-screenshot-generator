/* eslint-disable @typescript-eslint/unbound-method */
import { EventService } from './event.service';
import { StorageService } from '../../storage/services/storage.service';
import { VideoProcessingService } from '../../video-processing/services/video-processing.service';
import { UploadObjectEventPayload } from '../types/upload-object.type';
import { VideoProcessingJob } from '../../video-processing/models/video-processing-job.entity';

const mockStorageService = {
  generateAndSaveScreenshots: jest.fn(),
} as unknown as jest.Mocked<StorageService>;

const mockVideoProcessingService = {
  findJobById: jest.fn(),
  updateToProcessed: jest.fn(),
  updateToError: jest.fn(),
} as unknown as jest.Mocked<VideoProcessingService>;

const mockMailService = {
  sendVideoProcessingSuccessEmail: jest.fn(),
  sendVideoProcessingErrorEmail: jest.fn(),
};

const mockNotificationService = {
  createNotification: jest.fn(),
};

const makeEvent = (
  key: string,
  contentType = 'video/mp4',
): UploadObjectEventPayload => ({
  EventName: 's3:ObjectCreated:Put',
  Key: key,
  Records: [
    {
      s3: {
        bucket: { name: 'videos' },
        object: { key, size: 1024, contentType },
      },
    },
  ],
});

describe('EventService', () => {
  let service: EventService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new EventService(
      mockStorageService,
      mockVideoProcessingService,
      mockMailService as never,
      mockNotificationService as never,
    );
  });

  describe('handleVideoUpload — happy path', () => {
    it('finds the job, generates screenshots, and marks it as processed', async () => {
      const job = {
        id: 'job-123',
        user: { email: 'user@test.com', name: 'Test User' },
      } as VideoProcessingJob;
      mockVideoProcessingService.findJobById.mockResolvedValue(job);

      await service.handleVideoUpload(makeEvent('job-123.mp4'));

      expect(mockVideoProcessingService.findJobById).toHaveBeenCalledWith(
        'job-123',
      );
      expect(
        mockStorageService.generateAndSaveScreenshots,
      ).toHaveBeenCalledWith('job-123.mp4', 'job-123');
      expect(mockVideoProcessingService.updateToProcessed).toHaveBeenCalledWith(
        'job-123',
      );
      expect(mockMailService.sendVideoProcessingSuccessEmail).toHaveBeenCalledWith(
        'user@test.com',
        'Test User',
      );
      expect(mockNotificationService.createNotification).toHaveBeenCalledWith(
        'job-123',
        expect.any(String),
      );
      expect(mockVideoProcessingService.updateToError).not.toHaveBeenCalled();
    });

    it('decodes a URL-encoded key with "+" as spaces', async () => {
      const job = {
        id: 'job-123',
        user: { email: 'user@test.com', name: 'Test User' },
      } as VideoProcessingJob;
      mockVideoProcessingService.findJobById.mockResolvedValue(job);

      await service.handleVideoUpload(makeEvent('job-123.mp4'));

      expect(
        mockStorageService.generateAndSaveScreenshots,
      ).toHaveBeenCalledWith('job-123.mp4', 'job-123');
    });
  });

  describe('handleVideoUpload — validation errors', () => {
    it('does not call updateToError when Records is empty (no jobId yet)', async () => {
      await service.handleVideoUpload({
        ...makeEvent('job-123.mp4'),
        Records: [],
      });

      expect(mockVideoProcessingService.updateToError).not.toHaveBeenCalled();
      expect(
        mockStorageService.generateAndSaveScreenshots,
      ).not.toHaveBeenCalled();
    });

    it('calls updateToError when the file is not an MP4', async () => {
      await service.handleVideoUpload(makeEvent('job-123.avi', 'video/avi'));

      expect(
        mockStorageService.generateAndSaveScreenshots,
      ).not.toHaveBeenCalled();
      expect(mockVideoProcessingService.updateToError).toHaveBeenCalledWith(
        'job-123',
        'Invalid file type: video/avi. Only MP4 videos are supported.',
      );
    });
  });

  describe('handleVideoUpload — runtime errors', () => {
    it('calls updateToError when the job is not found in the database', async () => {
      mockVideoProcessingService.findJobById.mockResolvedValue(null);

      await service.handleVideoUpload(makeEvent('job-123.mp4'));

      expect(
        mockStorageService.generateAndSaveScreenshots,
      ).not.toHaveBeenCalled();
      expect(mockVideoProcessingService.updateToError).toHaveBeenCalledWith(
        'job-123',
        'No video processing job found for ID: job-123',
      );
    });

    it('calls updateToError when generateAndSaveScreenshots throws', async () => {
      const job = {
        id: 'job-123',
        user: { email: 'user@test.com', name: 'Test User' },
      } as VideoProcessingJob;
      mockVideoProcessingService.findJobById.mockResolvedValue(job);
      mockStorageService.generateAndSaveScreenshots.mockRejectedValue(
        new Error('S3 unavailable'),
      );

      await service.handleVideoUpload(makeEvent('job-123.mp4'));

      expect(
        mockVideoProcessingService.updateToProcessed,
      ).not.toHaveBeenCalled();
      expect(mockVideoProcessingService.updateToError).toHaveBeenCalledWith(
        'job-123',
        'S3 unavailable',
      );
    });
  });
});
