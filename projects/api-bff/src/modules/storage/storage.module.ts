import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { StorageController } from './storage.controller';
import { StorageService } from './storage.service';
import { StorageLocalService } from './storage-local.service';
import { AuthModule } from '../auth/auth.module';
import type { AppConfig } from 'src/config/validate-env';
import type { IStorageClient } from './storage.interface';

@Module({
  imports: [AuthModule],
  controllers: [StorageController],
  providers: [
    {
      provide: 'IStorageClient',
      useFactory: (configService: ConfigService<AppConfig>): IStorageClient => {
        const env = configService.get('NODE_ENV', { infer: true });
        if (env === 'test') {
          return new StorageLocalService();
        }
        return new StorageService(configService);
      },
      inject: [ConfigService],
    },
  ],
  exports: ['IStorageClient'],
})
export class StorageModule {}
