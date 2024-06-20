import { Model, Optional, Transaction } from "sequelize";
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
  fetchOne(query: IFindNotificationQuery): Promise<INotification | null>;
  fetchAll(query: IFindNotificationQuery): Promise<INotification[]>;
  create(
    record: INotificationCreationBody,
    options?: Partial<IFindNotificationQuery>
  ): Promise<INotification>;
  updateOne(
    data: Partial<INotification>,
    query: IFindNotificationQuery
  ): Promise<void>;
  fetchAllByUserId(userId: string): Promise<INotification[]>;
  markAsRead(notificationId: string): Promise<void>;
}

export interface IFindNotificationQuery {
  where: {
    [key: string]: any;
  };
  transaction?: Transaction;
  raw?: boolean;
  returning?: boolean
}
