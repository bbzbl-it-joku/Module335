import { Notification } from './types';
import { notificationSchema } from './schemas';

export class NotificationModel {
  private data: Notification;

  constructor(data: Omit<Notification, 'id' | 'createdAt'>) {
    this.data = notificationSchema.parse(data);
  }

  public toJSON(): Notification {
    return this.data;
  }
}
