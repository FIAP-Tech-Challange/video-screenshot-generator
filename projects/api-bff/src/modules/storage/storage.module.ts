import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { StorageService } from './storage.service';
import { StorageLocalService } from './storage-local.service';

import type { AppConfig } from 'src/config/validate-env';
import type { IStorageClient } from './storage.interface';

@Module({
  imports: [],
  controllers: [],
  providers: [
    {
      provide: 'IStorageClient',
      useFactory: (configService: ConfigService<AppConfig>): IStorageClient => {
        const env = configService.get('NODE_ENV', { infer: true });

        return env === 'test'
          ? new StorageLocalService()
          : new StorageService(configService);
      },
      inject: [ConfigService],
    },
  ],
  exports: ['IStorageClient'],
})
export class StorageModule {}
