/* eslint-disable @typescript-eslint/unbound-method */
import { Repository } from 'typeorm';
import { VideoProcessingRepositoryAdapter } from './video-processing-repository.adapter';
import {
  VideoProcessingJob,
  VideoProcessingJobStatus,
} from '../../../models/video-processing-job.entity';

const mockRepository = {
  findOne: jest.fn(),
  update: jest.fn(),
} as unknown as jest.Mocked<Repository<VideoProcessingJob>>;

describe('VideoProcessingRepositoryAdapter', () => {
  let adapter: VideoProcessingRepositoryAdapter;

  beforeEach(() => {
    jest.clearAllMocks();
    adapter = new VideoProcessingRepositoryAdapter(mockRepository);
  });

  describe('findById', () => {
    it('returns the job when found', async () => {
      const job = { id: 'job-123' } as VideoProcessingJob;
      mockRepository.findOne.mockResolvedValue(job);

      const result = await adapter.findById('job-123');

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'job-123' },
      });
      expect(result).toBe(job);
    });

    it('returns null when job is not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      const result = await adapter.findById('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('updateStatus', () => {
    it('updates only the status when no optional fields are provided', async () => {
      await adapter.updateStatus(
        'job-123',
        VideoProcessingJobStatus.PROCESSING,
      );

      expect(mockRepository.update).toHaveBeenCalledWith('job-123', {
        status: VideoProcessingJobStatus.PROCESSING,
      });
    });

    it('includes errorReason when provided', async () => {
      await adapter.updateStatus(
        'job-123',
        VideoProcessingJobStatus.ERROR,
        'something went wrong',
      );

      expect(mockRepository.update).toHaveBeenCalledWith('job-123', {
        status: VideoProcessingJobStatus.ERROR,
        errorReason: 'something went wrong',
      });
    });

    it('includes processedAt when provided', async () => {
      const processedAt = new Date('2024-01-01T00:00:00Z');

      await adapter.updateStatus(
        'job-123',
        VideoProcessingJobStatus.SUCCESS,
        undefined,
        processedAt,
      );

      expect(mockRepository.update).toHaveBeenCalledWith('job-123', {
        status: VideoProcessingJobStatus.SUCCESS,
        processedAt,
      });
    });

    it('includes all fields when all are provided', async () => {
      const processedAt = new Date('2024-01-01T00:00:00Z');

      await adapter.updateStatus(
        'job-123',
        VideoProcessingJobStatus.ERROR,
        'crash',
        processedAt,
      );

      expect(mockRepository.update).toHaveBeenCalledWith('job-123', {
        status: VideoProcessingJobStatus.ERROR,
        errorReason: 'crash',
        processedAt,
      });
    });
  });
});
