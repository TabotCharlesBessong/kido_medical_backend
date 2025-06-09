import { NotificationType } from "../interfaces/enum/notification.enum";
import {
  IMessage,
  IMessageCreationBody,
  IMessageDataSource,
} from "../interfaces/message.interface";
import { INotification, INotificationDataSource } from "../interfaces/notification.interface";
import UserService from "./user.services";
import streamService from "./stream.service";

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
    try {
      if (!record.senderId || !record.receiverId || !record.content) {
        throw new Error("Missing required message fields");
      }

      // Get or create a channel for the conversation
      const channel = await streamService.getOrCreateUserChannel(
        record.senderId,
        record.receiverId
      );

      if (!channel || !channel.id) {
        throw new Error("Failed to create or get channel");
      }

      // Send the message through Stream
      const streamMessage = await streamService.sendMessage(
        channel.id,
        record.senderId,
        record.content
      );

      if (!streamMessage || !streamMessage.message) {
        throw new Error("Failed to send message");
      }

      // Return a message object that matches our interface
      return {
        id: streamMessage.message.id,
        senderId: record.senderId,
        receiverId: record.receiverId,
        content: record.content,
        read: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    } catch (error) {
      console.error("Error creating message:", error);
      throw error;
    }
  }

  async getAllMessagesByUserId(userId: string): Promise<IMessage[]> {
    try {
      if (!userId) {
        throw new Error("User ID is required");
      }

      // Get all channels the user is a member of
      const channels = await streamService.queryUserChannels(userId);

      // Get messages from all channels
      const messages: IMessage[] = [];
      for (const channel of channels) {
        if (!channel.id) continue;

        const channelMessages = await streamService.getChannelMessages(channel.id);
        for (const msg of channelMessages) {
          if (msg.id && msg.user_id && msg.text) {
            const otherMember = channel.state.members[userId] ? 
              Object.keys(channel.state.members).find(id => id !== userId) : 
              undefined;

            if (otherMember) {
              messages.push({
                id: msg.id,
                senderId: msg.user_id,
                receiverId: otherMember,
                content: msg.text,
                read: false,
                createdAt: new Date(),
                updatedAt: new Date(),
              });
            }
          }
        }
      }

      return messages;
    } catch (error) {
      console.error("Error getting messages:", error);
      throw error;
    }
  }

  async getConversation(
    senderId: string,
    receiverId: string
  ): Promise<IMessage[]> {
    try {
      if (!senderId || !receiverId) {
        throw new Error("Both sender and receiver IDs are required");
      }

      // Get or create channel for the conversation
      const channel = await streamService.getOrCreateUserChannel(
        senderId,
        receiverId
      );

      if (!channel || !channel.id) {
        throw new Error("Failed to create or get channel");
      }

      // Get messages from the channel
      const messages = await streamService.getChannelMessages(channel.id);

      // Map Stream messages to our interface
      return messages
        .filter(msg => msg.id && msg.user_id && msg.text)
        .map(msg => ({
          id: msg.id!,
          senderId: msg.user_id!,
          receiverId: msg.user_id === senderId ? receiverId : senderId,
          content: msg.text!,
          read: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        }));
    } catch (error) {
      console.error("Error getting conversation:", error);
      throw error;
    }
  }

  async markMessageAsRead(messageId: string): Promise<void> {
    // Stream handles read receipts automatically
    return;
  }

  async getAllNotificationsByUserId(userId: string): Promise<INotification[]> {
    return await this.notificationDataSource.fetchAllByUserId(userId);
  }

  async markNotificationAsRead(notificationId: string): Promise<void> {
    await this.notificationDataSource.markAsRead(notificationId);
  }
}

export default MessageService;
