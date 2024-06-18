import { Model, Optional } from "sequelize";
import { NotificationType } from "./enum/notification.enum";


export interface INotification {
  id: string;
  userId: string;
  messageId?: string;
  appointmentId?: string;
  message: string;
  read: boolean;
  type: NotificationType;
  createdAt: Date;
  updatedAt: Date;
}

export interface INotificationCreationBody
  extends Optional<
    INotification,
    "id" | "createdAt" | "updatedAt" | "read" | "messageId" | "appointmentId"
  > {}

export interface INotificationModel
  extends Model<INotification, INotificationCreationBody>,
    INotification {}

export interface INotificationDataSource {
  create(record: INotificationCreationBody): Promise<INotification>;
  fetchAllByUserId(userId: string): Promise<INotification[]>;
  markAsRead(notificationId: string): Promise<void>;
}
