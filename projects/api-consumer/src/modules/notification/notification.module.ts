import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification } from './models/notification.entity';
import { NotificationRepositoryAdapter } from './adapters/secondary/database/notification-repository.adapter';
import { NotificationService } from './services/notification.service';

@Module({
  imports: [TypeOrmModule.forFeature([Notification])],
  providers: [
    NotificationService,
    {
      provide: 'NotificationRepositoryPort',
      useClass: NotificationRepositoryAdapter,
    },
  ],
  exports: [NotificationService],
})
export class NotificationModule {}
