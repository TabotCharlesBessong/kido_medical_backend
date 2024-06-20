import { NotificationType } from "../interfaces/enum/notification.enum";
import {
  IMessage,
  IMessageCreationBody,
  IMessageDataSource,
} from "../interfaces/message.interface";
import { INotification, INotificationDataSource } from "../interfaces/notification.interface";

class MessageService {
  private messageDataSource: IMessageDataSource;
  private notificationDataSource: INotificationDataSource;

  constructor(
    messageDataSource: IMessageDataSource,
    notificationDataSource: INotificationDataSource
  ) {
    this.messageDataSource = messageDataSource;
    this.notificationDataSource = notificationDataSource;
  }

  async createMessage(record: IMessageCreationBody): Promise<IMessage> {
    const message = await this.messageDataSource.create(record);
    await this.notificationDataSource.create({
      userId: record.receiverId,
      messageId: message.id,
      message: `New message from ${record.senderId}`,
      read: false,
      type: NotificationType.MESSAGE,
    });
    return message;
  }

  async getAllMessagesByUserId(userId: string): Promise<IMessage[]> {
    return await this.messageDataSource.fetchAllByUserId(userId);
  }

  async getConversation(
    senderId: string,
    receiverId: string
  ): Promise<IMessage[]> {
    return await this.messageDataSource.fetchConversation(senderId, receiverId);
  }

  async markMessageAsRead(messageId: string): Promise<void> {
    await this.messageDataSource.markAsRead(messageId);
  }

  async getAllNotificationsByUserId(userId: string): Promise<INotification[]> {
    return await this.notificationDataSource.fetchAllByUserId(userId);
  }

  async markNotificationAsRead(notificationId: string): Promise<void> {
    await this.notificationDataSource.markAsRead(notificationId);
  }
}

export default MessageService;
