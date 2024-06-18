import {
  INotification,
  INotificationCreationBody,
  INotificationDataSource,
} from "../interfaces/notification.interface";
import NotificationModel from "../models/notification.model";

class NotificationDataSource implements INotificationDataSource {
  async create(record: INotificationCreationBody): Promise<INotification> {
    return await NotificationModel.create(record);
  }

  async fetchAllByUserId(userId: string): Promise<INotification[]> {
    return await NotificationModel.findAll({
      where: { userId },
    });
  }

  async markAsRead(notificationId: string): Promise<void> {
    await NotificationModel.update(
      { read: true },
      { where: { id: notificationId } }
    );
  }
}

export default NotificationDataSource;
