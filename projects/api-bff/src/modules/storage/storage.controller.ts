import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { StorageService } from './storage.service';
import { JwtAuthGuard } from '../auth/jwt.guard';

@Controller('storage')
@UseGuards(JwtAuthGuard)
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  @Post('upload-url')
  async generateUploadUrl(
    @Body('fileName') fileName: string,
  ): Promise<{ url: string }> {
    const url = await this.storageService.generateUploadUrl(fileName);
    return { url };
  }
}
