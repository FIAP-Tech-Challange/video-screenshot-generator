import { Notification } from '../models/notification.entity';

export interface NotificationRepositoryPort {
  save(notification: Notification): Promise<Notification>;
}
