import { autoInjectable } from "tsyringe";
import NotificationDataSource from "../datasources/notification.datasource";
import {
  IFindNotificationQuery,
  INotification,
  INotificationCreationBody,
} from "../interfaces/notification.interface";
import { NotificationType } from "../interfaces/enum/notification.enum";

@autoInjectable()
class NotificationService {
  private notificationDataSource: NotificationDataSource;

  constructor(_notificationDataSource: NotificationDataSource) {
    this.notificationDataSource = _notificationDataSource;
  }

  async fetchNotificationById(id: string): Promise<INotification | null> {
    const query = {
      where: { id },
      raw: true,
    };
    return this.notificationDataSource.fetchOne(query);
  }

  async fetchAllNotifications(
    query: IFindNotificationQuery
  ): Promise<INotification[]> {
    return this.notificationDataSource.fetchAll(query);
  }

  async createNotification(
    data: Partial<INotification>
  ): Promise<INotification> {
    const notification = {
      ...data,
    } as INotificationCreationBody;
    return this.notificationDataSource.create(notification);
  }

  async createMessageNotification(
    userId: string,
    message: string,
    referenceId: string
  ): Promise<INotification> {
    return this.createNotification({
      userId,
      message,
      type: NotificationType.MESSAGE,
      referenceId,
    });
  }

  async createAppointmentNotification(
    userId: string,
    message: string,
    referenceId: string
  ): Promise<INotification> {
    return this.createNotification({
      userId,
      message,
      type: NotificationType.APPOINTMENT,
      referenceId,
    });
  }

  async createPrescriptionNotification(
    userId: string,
    message: string,
    referenceId: string
  ): Promise<INotification> {
    return this.createNotification({
      userId,
      message,
      type: NotificationType.PRESCRIPTION,
      referenceId,
    });
  }

  async markAsRead(notificationId: string): Promise<void> {
    const filter = { where: { id: notificationId } };
    const update = { read: true };
    await this.notificationDataSource.updateOne(update, filter);
  }
}

export default NotificationService;
