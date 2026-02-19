import { Injectable, Logger } from '@nestjs/common';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegStatic from 'ffmpeg-static';
import ffprobeStatic from 'ffprobe-static';
import { VideoProcessorPort } from '../../ports/output/video-processor.port';

@Injectable()
export class FfmpegVideoAdapter implements VideoProcessorPort {
  private readonly logger = new Logger(FfmpegVideoAdapter.name);

  constructor() {
    if (ffmpegStatic) {
      ffmpeg.setFfmpegPath(ffmpegStatic as unknown as string);
    }
    if (ffprobeStatic.path) {
      ffmpeg.setFfprobePath(ffprobeStatic.path);
    }
  }

  async generateScreenshots(
    videoPath: string,
    outputDir: string,
    count: number = 10,
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      ffmpeg(videoPath)
        .on('end', () => {
          this.logger.log('Screenshot generation completed');
          resolve();
        })
        .on('error', (err: Error) => {
          this.logger.error('FFmpeg error', err);
          reject(err);
        })
        .screenshots({
          count: count > 0 && count < 20 ? count : 10,
          folder: outputDir,
          filename: 'screenshot-%i.jpg',
          size: '1280x720',
        });
    });
  }
}
