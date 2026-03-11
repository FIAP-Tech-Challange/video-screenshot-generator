import { FfmpegVideoAdapter } from './ffmpeg-video.adapter';

jest.mock('ffmpeg-static', () => '/usr/bin/ffmpeg');
jest.mock('ffprobe-static', () => ({ path: '/usr/bin/ffprobe' }));

const mockScreenshots = jest.fn();
const mockOn = jest.fn();

const mockFfmpegInstance = {
  on: jest.fn().mockImplementation(function (
    this: typeof mockFfmpegInstance,
    event: string,
    handler: (...args: unknown[]) => void,
  ) {
    mockOn(event, handler);
    if (event === 'end') setTimeout(() => handler(), 0);
    return this;
  }),
  screenshots: mockScreenshots.mockReturnThis(),
};

jest.mock('fluent-ffmpeg', () => {
  const mock = jest.fn(() => mockFfmpegInstance) as jest.Mock & {
    setFfmpegPath: jest.Mock;
    setFfprobePath: jest.Mock;
  };
  mock.setFfmpegPath = jest.fn();
  mock.setFfprobePath = jest.fn();
  return { __esModule: true, default: mock };
});

import ffmpeg from 'fluent-ffmpeg';

describe('FfmpegVideoAdapter', () => {
  let adapter: FfmpegVideoAdapter;

  beforeEach(() => {
    jest.clearAllMocks();

    // restore default: 'end' resolves
    mockFfmpegInstance.on.mockImplementation(function (
      this: typeof mockFfmpegInstance,
      event: string,
      handler: (...args: unknown[]) => void,
    ) {
      mockOn(event, handler);
      if (event === 'end') setTimeout(() => handler(), 0);
      return this;
    });

    adapter = new FfmpegVideoAdapter();
  });

  describe('constructor', () => {
    it('sets the ffmpeg and ffprobe paths on startup', () => {
      expect(ffmpeg.setFfmpegPath).toHaveBeenCalledWith('/usr/bin/ffmpeg');
      expect(ffmpeg.setFfprobePath).toHaveBeenCalledWith('/usr/bin/ffprobe');
    });
  });

  describe('generateScreenshots', () => {
    it('resolves when ffmpeg fires the end event', async () => {
      await expect(
        adapter.generateScreenshots('/video.mp4', '/output'),
      ).resolves.toBeUndefined();
    });

    it('passes the correct screenshot options to ffmpeg', async () => {
      await adapter.generateScreenshots('/video.mp4', '/output', 5);

      expect(mockScreenshots).toHaveBeenCalledWith({
        count: 5,
        folder: '/output',
        filename: 'screenshot-%i.jpg',
        size: '1280x720',
      });
    });

    it('rejects when ffmpeg fires the error event', async () => {
      mockFfmpegInstance.on.mockImplementation(function (
        this: typeof mockFfmpegInstance,
        event: string,
        handler: (err?: Error) => void,
      ) {
        if (event === 'error')
          setTimeout(() => handler(new Error('ffmpeg crashed')), 0);
        return this;
      });

      await expect(
        adapter.generateScreenshots('/video.mp4', '/output'),
      ).rejects.toThrow('ffmpeg crashed');
    });

    it.each([
      [0, 10],
      [-1, 10],
      [20, 10],
      [25, 10],
      [1, 1],
      [19, 19],
    ])('clamps count %i to %i', async (input, expected) => {
      await adapter.generateScreenshots('/video.mp4', '/output', input);

      expect(mockScreenshots).toHaveBeenCalledWith(
        expect.objectContaining({ count: expected }),
      );
    });
  });
});
