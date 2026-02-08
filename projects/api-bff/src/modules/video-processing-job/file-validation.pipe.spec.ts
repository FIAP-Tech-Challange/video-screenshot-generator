import { BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FileValidationPipe } from './file-validation.pipe';
import type { MulterFile } from './types';

describe('FileValidationPipe', () => {
  let pipe: FileValidationPipe;
  let configService: ConfigService;

  beforeEach(() => {
    configService = new ConfigService({
      MAX_FILE_SIZE_MB: 10,
    });
    pipe = new FileValidationPipe(configService);
  });

  const createMockFile = (overrides: Partial<MulterFile> = {}): MulterFile => ({
    fieldname: 'file',
    originalname: 'video.mp4',
    encoding: '7bit',
    mimetype: 'video/mp4',
    size: 1024 * 1024, // 1MB
    buffer: Buffer.from('fake video content'),
    ...overrides,
  });

  describe('valid files', () => {
    it('should pass validation for a valid MP4 file', () => {
      const file = createMockFile();

      const result = pipe.transform(file);

      expect(result).toEqual(file);
    });

    it('should pass validation for MP4 with uppercase extension', () => {
      const file = createMockFile({ originalname: 'VIDEO.MP4' });

      const result = pipe.transform(file);

      expect(result).toEqual(file);
    });

    it('should pass validation for MP4 with mixed case extension', () => {
      const file = createMockFile({ originalname: 'video.Mp4' });

      const result = pipe.transform(file);

      expect(result).toEqual(file);
    });

    it('should pass validation for file at exactly max size', () => {
      const file = createMockFile({ size: 10 * 1024 * 1024 }); // Exactly 10MB

      const result = pipe.transform(file);

      expect(result).toEqual(file);
    });

    it('should pass validation for small file', () => {
      const file = createMockFile({ size: 1024 }); // 1KB

      const result = pipe.transform(file);

      expect(result).toEqual(file);
    });
  });

  describe('file is required', () => {
    it('should throw BadRequestException when file is undefined', () => {
      expect(() => pipe.transform(undefined)).toThrow(BadRequestException);
      expect(() => pipe.transform(undefined)).toThrow('File is required');
    });
  });

  describe('file extension validation', () => {
    it('should throw BadRequestException for non-MP4 extension', () => {
      const file = createMockFile({ originalname: 'video.avi' });

      expect(() => pipe.transform(file)).toThrow(BadRequestException);
      expect(() => pipe.transform(file)).toThrow('Only MP4 files are allowed');
    });

    it('should throw BadRequestException for MOV files', () => {
      const file = createMockFile({ originalname: 'video.mov' });

      expect(() => pipe.transform(file)).toThrow(BadRequestException);
    });

    it('should throw BadRequestException for MKV files', () => {
      const file = createMockFile({ originalname: 'video.mkv' });

      expect(() => pipe.transform(file)).toThrow(BadRequestException);
    });

    it('should throw BadRequestException for files without extension', () => {
      const file = createMockFile({ originalname: 'video' });

      expect(() => pipe.transform(file)).toThrow(BadRequestException);
    });

    it('should throw BadRequestException for empty filename', () => {
      const file = createMockFile({ originalname: '' });

      expect(() => pipe.transform(file)).toThrow(BadRequestException);
    });

    it('should throw BadRequestException for .mp4 in middle of filename', () => {
      const file = createMockFile({ originalname: 'video.mp4.avi' });

      expect(() => pipe.transform(file)).toThrow(BadRequestException);
    });
  });

  describe('MIME type validation', () => {
    it('should throw BadRequestException for incorrect MIME type', () => {
      const file = createMockFile({
        originalname: 'video.mp4',
        mimetype: 'video/avi',
      });

      expect(() => pipe.transform(file)).toThrow(BadRequestException);
      expect(() => pipe.transform(file)).toThrow(
        'Invalid file type. Only video/mp4 is allowed',
      );
    });

    it('should throw BadRequestException for application/octet-stream', () => {
      const file = createMockFile({
        originalname: 'video.mp4',
        mimetype: 'application/octet-stream',
      });

      expect(() => pipe.transform(file)).toThrow(BadRequestException);
    });

    it('should throw BadRequestException for video/quicktime', () => {
      const file = createMockFile({
        originalname: 'video.mp4',
        mimetype: 'video/quicktime',
      });

      expect(() => pipe.transform(file)).toThrow(BadRequestException);
    });
  });

  describe('file size validation', () => {
    it('should throw BadRequestException for file exceeding max size', () => {
      const file = createMockFile({
        size: 11 * 1024 * 1024, // 11MB (max is 10MB)
      });

      expect(() => pipe.transform(file)).toThrow(BadRequestException);
      expect(() => pipe.transform(file)).toThrow(
        'File size exceeds maximum allowed size of 10MB',
      );
    });

    it('should throw BadRequestException for very large file', () => {
      const file = createMockFile({
        size: 100 * 1024 * 1024, // 100MB
      });

      expect(() => pipe.transform(file)).toThrow(BadRequestException);
    });

    it('should throw BadRequestException for empty file', () => {
      const file = createMockFile({ size: 0 });

      expect(() => pipe.transform(file)).toThrow(BadRequestException);
      expect(() => pipe.transform(file)).toThrow('File cannot be empty');
    });
  });

  describe('configuration', () => {
    it('should use configured max file size', () => {
      const customConfigService = new ConfigService({
        MAX_FILE_SIZE_MB: 5,
      });
      const customPipe = new FileValidationPipe(customConfigService);

      const file = createMockFile({
        size: 6 * 1024 * 1024, // 6MB
      });

      expect(() => customPipe.transform(file)).toThrow(BadRequestException);
      expect(() => customPipe.transform(file)).toThrow(
        'File size exceeds maximum allowed size of 5MB',
      );
    });

    it('should allow file under custom max size', () => {
      const customConfigService = new ConfigService({
        MAX_FILE_SIZE_MB: 20,
      });
      const customPipe = new FileValidationPipe(customConfigService);

      const file = createMockFile({
        size: 15 * 1024 * 1024, // 15MB
      });

      const result = customPipe.transform(file);

      expect(result).toEqual(file);
    });
  });

  describe('edge cases', () => {
    it('should handle filename with multiple dots', () => {
      const file = createMockFile({
        originalname: 'my.video.file.mp4',
      });

      const result = pipe.transform(file);

      expect(result).toEqual(file);
    });

    it('should handle filename with spaces', () => {
      const file = createMockFile({
        originalname: 'my video file.mp4',
      });

      const result = pipe.transform(file);

      expect(result).toEqual(file);
    });

    it('should handle filename with special characters', () => {
      const file = createMockFile({
        originalname: 'video_2024-01-15_v1.0.mp4',
      });

      const result = pipe.transform(file);

      expect(result).toEqual(file);
    });

    it('should reject file with .mp4.txt extension spoofing', () => {
      const file = createMockFile({
        originalname: 'malicious.mp4.txt',
      });

      expect(() => pipe.transform(file)).toThrow(BadRequestException);
    });
  });
});
