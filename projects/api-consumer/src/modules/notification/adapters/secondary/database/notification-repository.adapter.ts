import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from '../../../models/notification.entity';
import type { NotificationRepositoryPort } from '../../../ports/notification-repository.port';

@Injectable()
export class NotificationRepositoryAdapter implements NotificationRepositoryPort {
  constructor(
    @InjectRepository(Notification)
    private readonly repository: Repository<Notification>,
  ) {}

  async save(notification: Notification): Promise<Notification> {
    const savedNotification = await this.repository.save(notification);
    return savedNotification;
  }
}
