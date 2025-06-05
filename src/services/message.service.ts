import { NotificationType } from "../interfaces/enum/notification.enum";
import {
  IMessage,
  IMessageCreationBody,
  IMessageDataSource,
} from "../interfaces/message.interface";
import { INotification, INotificationDataSource } from "../interfaces/notification.interface";
import UserService from "./user.services";

class MessageService {
  private messageDataSource: IMessageDataSource;
  private notificationDataSource: INotificationDataSource;
  private userService: UserService;

  constructor(
    messageDataSource: IMessageDataSource,
    notificationDataSource: INotificationDataSource
  ) {
    this.messageDataSource = messageDataSource;
    this.notificationDataSource = notificationDataSource;
    this.userService = new UserService();
  }

  async createMessage(record: IMessageCreationBody): Promise<IMessage> {
    console.log('Creating message with record:', record);
    
    // First verify the receiver exists
    const receiver = await this.userService.getUserByField({ id: record.receiverId });
    console.log('Receiver lookup result:', receiver ? 'Found' : 'Not found');
    
    if (!receiver) {
      throw new Error("Receiver not found");
    }

    // Then verify the sender exists
    const sender = await this.userService.getUserByField({ id: record.senderId });
    console.log('Sender lookup result:', sender ? 'Found' : 'Not found');
    
    if (!sender) {
      throw new Error("Sender not found");
    }

    // Create the message
    const message = await this.messageDataSource.create(record);
    
    // Create notification
    await this.notificationDataSource.create({
      userId: record.receiverId,
      referenceId: message.id,
      message: `New message from ${sender.firstname} ${sender.lastname}`,
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
