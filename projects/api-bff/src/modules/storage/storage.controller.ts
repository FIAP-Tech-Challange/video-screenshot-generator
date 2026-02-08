import { Controller, Post, Body, UseGuards, Inject } from '@nestjs/common';
import type { IStorageClient } from './storage.interface';
import { JwtAuthGuard } from '../auth/jwt.guard';

@Controller('storage')
@UseGuards(JwtAuthGuard)
export class StorageController {
  constructor(
    @Inject('IStorageClient')
    private readonly storageService: IStorageClient,
  ) {}

  @Post('upload-url')
  async generateUploadUrl(
    @Body('fileName') fileName: string,
  ): Promise<{ url: string }> {
    const url = await this.storageService.generateUploadUrl(fileName);
    return { url };
  }
}
