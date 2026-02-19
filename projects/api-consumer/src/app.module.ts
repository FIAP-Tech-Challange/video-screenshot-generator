import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { validateEnv } from './config/validate-env';
import { TypeOrmModule } from '@nestjs/typeorm';
import { createTypeOrmConfig } from './config/typeorm.config';
import { StorageModule } from './modules/storage/storage.module';
import { EventModule } from './modules/event/event.module';
import { VideoProcessingModule } from './modules/video-processing/video-processing.module';
import { HealthModule } from './config/health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
      validate: validateEnv,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => createTypeOrmConfig(config),
    }),
    StorageModule,
    EventModule,
    VideoProcessingModule,
    HealthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
