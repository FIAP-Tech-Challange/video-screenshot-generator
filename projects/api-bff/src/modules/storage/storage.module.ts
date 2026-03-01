import { Module } from '@nestjs/common';
import { MinIoStorageClient } from './minio-storage-client';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: 'IStorageClient',
      useClass: MinIoStorageClient,
    },
  ],
  exports: ['IStorageClient'],
})
export class StorageModule {}
