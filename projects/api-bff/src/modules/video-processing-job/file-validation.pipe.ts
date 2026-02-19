import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { AppConfig } from '../../config/validate-env';
import type { MulterFile } from './types';

@Injectable()
export class FileValidationPipe implements PipeTransform {
  private readonly maxFileSizeMB: number;
  private readonly maxFileSizeBytes: number;

  constructor(private readonly configService: ConfigService<AppConfig>) {
    this.maxFileSizeMB = this.configService.get('MAX_FILE_SIZE_MB', {
      infer: true,
    })!;
    this.maxFileSizeBytes = this.maxFileSizeMB * 1024 * 1024;
  }

  transform(file: MulterFile | undefined): MulterFile {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    if (!file.originalname.toLowerCase().endsWith('.mp4')) {
      throw new BadRequestException('Only MP4 files are allowed');
    }

    if (file.mimetype !== 'video/mp4') {
      throw new BadRequestException(
        'Invalid file type. Only video/mp4 is allowed',
      );
    }

    if (file.size > this.maxFileSizeBytes) {
      throw new BadRequestException(
        `File size exceeds maximum allowed size of ${this.maxFileSizeMB}MB`,
      );
    }

    if (file.size === 0) {
      throw new BadRequestException('File cannot be empty');
    }

    return file;
  }
}
