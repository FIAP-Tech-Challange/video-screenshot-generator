import { BadRequestException, Body, Controller, Post } from '@nestjs/common';
import { GenerateScreenshotsDto } from '../../models/dto/generate-screenshots.dto';
import { StorageService } from '../../services/storage.service';

@Controller({
  path: 'consumer',
  version: '1',
})
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  @Post('presigned-url')
  public async getPresignedUrl() {
    try {
      return await this.storageService.getPresignedUploadUrl();
    } catch (error: any) {
      throw new BadRequestException(error.message || error);
    }
  }

  @Post('generate-screenshots')
  public async generateScreenshots(@Body() body: GenerateScreenshotsDto) {
    try {
      return await this.storageService.generateAndSaveScreenshots(
        body.key,
        body.count,
      );
    } catch (error: any) {
      throw new BadRequestException(error.message || error);
    }
  }

  @Post('download-screenshots')
  public async downloadScreenshots(@Body() body: GenerateScreenshotsDto) {
    try {
      return await this.storageService.getPresignedDownloadUrl(body.key);
    } catch (error: any) {
      throw new BadRequestException(error.message || error);
    }
  }
}
