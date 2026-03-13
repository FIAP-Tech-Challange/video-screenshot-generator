/* eslint-disable @typescript-eslint/unbound-method */
import { ConfigService } from '@nestjs/config';
import { StorageService } from './storage.service';
import type { FileStoragePort } from '../ports/output/file-storage.port';
import type { VideoProcessorPort } from '../ports/output/video-processor.port';
import { Readable, PassThrough } from 'stream';

// ─── Module mocks (hoisted) ──────────────────────────────────────────────────

jest.mock('crypto', () => ({
  randomUUID: jest.fn(() => 'test-uuid'),
}));

jest.mock('fs', () => {
  const actual = jest.requireActual<typeof import('fs')>('fs');
  return {
    ...actual,
    createWriteStream: jest.fn(),
    promises: {
      mkdir: jest.fn().mockResolvedValue(undefined),
      readFile: jest.fn().mockResolvedValue(Buffer.from('zip-content')),
      rm: jest.fn().mockResolvedValue(undefined),
      stat: jest.fn().mockResolvedValue({ size: 1024 }),
    },
  };
});

// Archiver mock: captures the output stream passed to pipe() and fires its
// 'close' listeners when finalize() is called, which is how the real archiver
// signals completion to createZipFile's Promise.
jest.mock('archiver', () =>
  jest.fn(() => {
    const closeListeners: (() => void)[] = [];
    const errorListeners: ((err: Error) => void)[] = [];
    let capturedOutput: { emit: (event: string) => void } | null = null;

    return {
      pipe: jest.fn((dest: { emit: (event: string) => void }) => {
        capturedOutput = dest;
      }),
      directory: jest.fn(),
      finalize: jest.fn(() => {
        // Simulate archiver finishing: emit 'close' on the output WriteStream.
        // The real archiver does this after flushing; we do it synchronously.
        if (capturedOutput) capturedOutput.emit('close');
        closeListeners.forEach((fn) => fn());
      }),
      pointer: jest.fn(() => 100),
      on: jest.fn((event: string, handler: (...args: unknown[]) => void) => {
        if (event === 'close') closeListeners.push(handler as () => void);
        if (event === 'error')
          errorListeners.push(handler as (err: Error) => void);
      }),
    };
  }),
);

// ─── Imports that depend on mocked modules ───────────────────────────────────

import { createWriteStream, promises as fs } from 'fs';

const mockCreateWriteStream = createWriteStream as jest.Mock;

// ─── Port mocks ───────────────────────────────────────────────────────────────

const mockFileStorage: jest.Mocked<FileStoragePort> = {
  uploadFile: jest.fn().mockResolvedValue(undefined),
  downloadFile: jest.fn(),
  checkConnection: jest.fn().mockResolvedValue(undefined),
  ensureBucketExists: jest.fn().mockResolvedValue(undefined),
};

const mockVideoProcessor: jest.Mocked<VideoProcessorPort> = {
  generateScreenshots: jest.fn().mockResolvedValue(undefined),
};

const mockConfigService = {
  getOrThrow: jest.fn((key: string) => {
    const config: Record<string, string> = {
      BUCKET_VIDEO_NAME: 'videos',
      BUCKET_SCREENSHOT_NAME: 'screenshots',
    };
    return config[key];
  }),
} as unknown as ConfigService;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeVideoStream(): Readable {
  const stream = new Readable({ read() {} });
  setTimeout(() => {
    stream.push('video-data');
    stream.push(null);
  }, 0);
  return stream;
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('StorageService', () => {
  let service: StorageService;

  beforeEach(() => {
    jest.clearAllMocks();

    // Provide a real PassThrough as the WriteStream returned by createWriteStream.
    // The archiver mock will call .emit('close') on it directly via pipe capture.
    mockCreateWriteStream.mockReturnValue(new PassThrough());

    mockFileStorage.downloadFile.mockResolvedValue(
      makeVideoStream() as unknown as NodeJS.ReadableStream,
    );

    service = new StorageService(
      mockConfigService,
      mockFileStorage,
      mockVideoProcessor,
    );
  });

  describe('onModuleInit', () => {
    it('checks connection and ensures both buckets exist on successful init', async () => {
      await service.onModuleInit();

      expect(mockFileStorage.checkConnection).toHaveBeenCalledTimes(1);
      expect(mockFileStorage.ensureBucketExists).toHaveBeenCalledWith('videos');
      expect(mockFileStorage.ensureBucketExists).toHaveBeenCalledWith(
        'screenshots',
      );
    });

    it('triggers retryConnection when checkConnection fails on init', async () => {
      mockFileStorage.checkConnection
        .mockRejectedValueOnce(new Error('S3 down'))
        .mockResolvedValue(undefined);

      await service.onModuleInit();

      // first call fails (onModuleInit), second succeeds (retryConnection)
      expect(mockFileStorage.checkConnection).toHaveBeenCalledTimes(2);
    });
  });

  describe('generateAndSaveScreenshots', () => {
    it('executes the full pipeline: download → screenshots → zip → upload', async () => {
      await service.generateAndSaveScreenshots('job-123.mp4', 'job-123');

      expect(mockFileStorage.downloadFile).toHaveBeenCalledWith(
        'videos',
        'job-123.mp4',
      );
      expect(mockVideoProcessor.generateScreenshots).toHaveBeenCalledTimes(1);
      expect(mockFileStorage.uploadFile).toHaveBeenCalledWith(
        'screenshots',
        'job-123.zip',
        expect.any(Buffer),
        'application/zip',
      );
    });

    it('uses the jobId as the zip filename', async () => {
      await service.generateAndSaveScreenshots('some-video.mp4', 'my-job-id');

      expect(mockFileStorage.uploadFile).toHaveBeenCalledWith(
        'screenshots',
        'my-job-id.zip',
        expect.any(Buffer),
        'application/zip',
      );
    });

    it('cleans up the temp directory even when generateScreenshots throws', async () => {
      mockVideoProcessor.generateScreenshots.mockRejectedValueOnce(
        new Error('ffmpeg crashed'),
      );

      await expect(
        service.generateAndSaveScreenshots('job-123.mp4', 'job-123'),
      ).rejects.toThrow('ffmpeg crashed');

      expect(fs.rm).toHaveBeenCalledWith(
        expect.stringContaining('screenshots-test-uuid'),
        { recursive: true, force: true },
      );
    });

    it('throws when the downloaded video file is empty', async () => {
      (fs.stat as jest.Mock).mockResolvedValueOnce({ size: 0 });

      await expect(
        service.generateAndSaveScreenshots('job-123.mp4', 'job-123'),
      ).rejects.toThrow('Downloaded video file is empty');
    });

    it('cleans up the temp directory even when uploadFile throws', async () => {
      mockFileStorage.uploadFile.mockRejectedValueOnce(new Error('S3 error'));

      await expect(
        service.generateAndSaveScreenshots('job-123.mp4', 'job-123'),
      ).rejects.toThrow('S3 error');

      expect(fs.rm).toHaveBeenCalledWith(
        expect.stringContaining('screenshots-test-uuid'),
        { recursive: true, force: true },
      );
    });
  });
});
