import {
  INotification,
  INotificationDataSource,
} from "../interfaces/notification.interface";

class NotificationService {
  private notificationDataSource: INotificationDataSource;

  constructor(notificationDataSource: INotificationDataSource) {
    this.notificationDataSource = notificationDataSource;
  }

  async getAllNotificationsByUserId(userId: string): Promise<INotification[]> {
    return await this.notificationDataSource.fetchAllByUserId(userId);
  }

  async markNotificationAsRead(notificationId: string): Promise<void> {
    await this.notificationDataSource.markAsRead(notificationId);
  }
}

export default NotificationService;
