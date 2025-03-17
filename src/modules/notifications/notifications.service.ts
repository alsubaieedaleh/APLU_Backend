import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Notification, NotificationDocument } from './schemas/notification.schema';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectModel(Notification.name)
    private notificationModel: Model<NotificationDocument>,
  ) {}

  async getNotifications(userId: string) {
    // Return notifications for the given user, sorted by newest first.
    return this.notificationModel.find({ userId }).sort({ createdAt: -1 });
  }

  async createNotification(data: { userId: string; message: string; type: string }) {
    // Create a new notification document using the provided data.
    return this.notificationModel.create(data);
  }

  async markAsRead(id: string) {
    // Update the notification with the given ID to mark it as read.
    return this.notificationModel.findByIdAndUpdate(
      id,
      { read: true },
      { new: true }
    );
  }
}
