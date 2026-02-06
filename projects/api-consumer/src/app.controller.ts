import { BadRequestException, Body, Controller, Post } from '@nestjs/common';
import { BucketService } from './modules/bucket/bucket.service';
import { GenerateScreenshotsDto } from './dto/generate-screenshots.dto';

@Controller({
  path: 'consumer',
  version: '1',
})
export class AppController {
  constructor(private readonly bucketService: BucketService) {}

  @Post('presigned-url')
  public async getPresignedUrl() {
    try {
      return await this.bucketService.getPresignedUploadUrl();
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  @Post('generate-screenshots')
  public async generateScreenshots(@Body() body: GenerateScreenshotsDto) {
    try {
      return await this.bucketService.generateAndSaveScreenshots(body.key);
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  @Post('download-screenshots')
  public async downloadScreenshots(@Body() body: GenerateScreenshotsDto) {
    try {
      return await this.bucketService.getPresignedDownloadUrl(body.key);
    } catch (error) {
      throw new BadRequestException(error);
    }
  }
}
