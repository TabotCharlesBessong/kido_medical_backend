import { NotificationType } from "../interfaces/enum/notification.enum";
import {
  IMessage,
  IMessageCreationBody,
  IMessageDataSource,
} from "../interfaces/message.interface";

class MessageService {
  private messageDataSource: IMessageDataSource;

  constructor(
    messageDataSource: IMessageDataSource,
  ) {
    this.messageDataSource = messageDataSource;
  }

  async createMessage(record: IMessageCreationBody): Promise<IMessage> {
    const message = await this.messageDataSource.create(record);
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
}

export default MessageService;
