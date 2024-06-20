// import { autoInjectable } from "tsyringe";
// import NotificationDataSource from "../datasources/notification.datasource";
// import {
//   IFindNotificationQuery,
//   INotification,
//   INotificationCreationBody,
// } from "../interfaces/notification.interface";

// @autoInjectable()
// class NotificationService {
//   private notificationDataSource: NotificationDataSource;

//   constructor(_notificationDataSource: NotificationDataSource) {
//     this.notificationDataSource = _notificationDataSource;
//   }

//   async fetchNotificationById(id: string): Promise<INotification | null> {
//     const query = {
//       where: { id },
//       raw: true,
//     };
//     return this.notificationDataSource.fetchOne(query);
//   }

//   async fetchAllNotifications(
//     query: IFindNotificationQuery
//   ): Promise<INotification[]> {
//     return this.notificationDataSource.fetchAll(query);
//   }

//   async createNotification(
//     data: Partial<INotification>
//   ): Promise<INotification> {
//     const notification = {
//       ...data,
//     } as INotificationCreationBody;
//     return this.notificationDataSource.create(notification);
//   }

//   async markAsRead(notificationId: string): Promise<void> {
//     const filter = { where: { id: notificationId } };
//     const update = { read: true };
//     await this.notificationDataSource.updateOne(update, filter);
//   }
// }

// export default NotificationService;
