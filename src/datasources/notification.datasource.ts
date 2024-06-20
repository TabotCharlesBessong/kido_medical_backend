import { FindOptions } from "sequelize";
import {
  IFindNotificationQuery,
  INotification,
  INotificationCreationBody,
  INotificationDataSource,
} from "../interfaces/notification.interface";
import NotificationModel from "../models/notification.model";

class NotificationDataSource implements INotificationDataSource {
  async create(
    record: INotificationCreationBody,
    options?: Partial<IFindNotificationQuery>
  ): Promise<INotification> {
    return await NotificationModel.create(record, {
      returning: true,
      ...options,
    });
  }

  async fetchOne(query: IFindNotificationQuery): Promise<INotification | null> {
    return await NotificationModel.findOne(query);
  }

  async fetchAll(query: FindOptions<INotification>): Promise<INotification[]> {
    return await NotificationModel.findAll(query);
  }

  async updateOne(
    data: Partial<INotification>,
    query: IFindNotificationQuery
  ): Promise<void> {
    await NotificationModel.update(data, query);
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
