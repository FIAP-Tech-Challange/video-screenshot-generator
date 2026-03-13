import { Injectable, Inject, Logger } from '@nestjs/common';
import { Notification } from '../models/notification.entity';
import type { NotificationRepositoryPort } from '../ports/notification-repository.port';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    @Inject('NotificationRepositoryPort')
    private readonly repository: NotificationRepositoryPort,
  ) {}

  async createNotification(
    processingJobId: string,
    message: string,
  ): Promise<Notification> {
    const notification = new Notification();
    notification.processingJobId = processingJobId;
    notification.message = message;

    const savedNotification = await this.repository.save(notification);
    this.logger.log(`Notification created for job ${processingJobId}`);
    return savedNotification;
  }
}
