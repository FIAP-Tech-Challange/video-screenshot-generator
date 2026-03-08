import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { StorageModule } from './modules/storage/storage.module';
import { validateEnv } from './config/validate-env';
import { createTypeOrmConfig } from './config/typeorm.config';
import { VideoProcessingJobModule } from './modules/video-processing-job/video-processing-job.module';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { CacheModule } from './modules/cache/cache.module';

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
    PrometheusModule.register({
      path: '/metrics',
      defaultMetrics: {
        enabled: true,
      },
    }),
    CacheModule,
    UsersModule,
    AuthModule,
    StorageModule,
    VideoProcessingJobModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
