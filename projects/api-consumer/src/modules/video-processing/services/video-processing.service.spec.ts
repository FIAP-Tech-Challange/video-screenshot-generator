import { VideoProcessingService } from './video-processing.service';
import {
  VideoProcessingJob,
  VideoProcessingJobStatus,
} from '../models/video-processing-job.entity';
import type { VideoProcessingRepositoryPort } from '../ports/video-processing-repository.port';

const mockRepository: jest.Mocked<VideoProcessingRepositoryPort> = {
  findById: jest.fn(),
  updateStatus: jest.fn(),
};

describe('VideoProcessingService', () => {
  let service: VideoProcessingService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new VideoProcessingService(mockRepository);
  });

  describe('findJobById', () => {
    it('returns the job when found', async () => {
      const job = { id: 'job-123' } as VideoProcessingJob;
      mockRepository.findById.mockResolvedValue(job);

      const result = await service.findJobById('job-123');

      expect(mockRepository.findById).toHaveBeenCalledWith('job-123');
      expect(result).toBe(job);
    });

    it('returns null when job is not found', async () => {
      mockRepository.findById.mockResolvedValue(null);

      const result = await service.findJobById('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('updateToProcessed', () => {
    it('calls updateStatus with SUCCESS and a processedAt date', async () => {
      await service.updateToProcessed('job-123');

      expect(mockRepository.updateStatus).toHaveBeenCalledWith(
        'job-123',
        VideoProcessingJobStatus.SUCCESS,
        undefined,
        expect.any(Date),
      );
    });
  });

  describe('updateToError', () => {
    it('calls updateStatus with ERROR, the error reason, and a processedAt date', async () => {
      await service.updateToError('job-123', 'something went wrong');

      expect(mockRepository.updateStatus).toHaveBeenCalledWith(
        'job-123',
        VideoProcessingJobStatus.ERROR,
        'something went wrong',
        expect.any(Date),
      );
    });
  });
});
