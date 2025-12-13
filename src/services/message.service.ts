import { NotificationType } from "../interfaces/enum/notification.enum";
import {
  IMessage,
  IMessageCreationBody,
  IMessageDataSource,
} from "../interfaces/message.interface";
import { INotification, INotificationDataSource } from "../interfaces/notification.interface";
import UserService from "./user.services";
import streamService from "./stream.service";
import UserDataSource from "../datasources/user.datasource";
import TokenDataSource from "../datasources/token.datasource";

const userDataSource = new UserDataSource();
const tokenDataSource = new TokenDataSource();
const userService = new UserService(userDataSource, tokenDataSource);

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
    this.userService = userService;
  }

  async createMessage(record: IMessageCreationBody): Promise<IMessage> {
    try {
      if (!record.senderId || !record.receiverId || !record.content) {
        throw new Error("Missing required message fields");
      }

      // Validate that sender and receiver exist
      const sender = await this.userService.getUserByField({ id: record.senderId });
      if (!sender) {
        throw new Error("Sender not found");
      }

      const receiver = await this.userService.getUserByField({ id: record.receiverId });
      if (!receiver) {
        throw new Error("Receiver not found");
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
      let streamMessage;
      try {
        streamMessage = await streamService.sendMessage(
          channel.id,
          record.senderId,
          record.content
        );
      } catch (streamError) {
        console.error("Error sending message to Stream:", streamError);
        // Continue to save to database even if Stream fails
      }

      // Persist message to database
      const dbMessage = await this.messageDataSource.create({
        senderId: record.senderId,
        receiverId: record.receiverId,
        content: record.content,
        read: false
      });

      // If Stream message was sent, use its ID, otherwise use DB ID
      const messageId = streamMessage?.message?.id || dbMessage.id;

      // Update DB message with Stream ID if available
      if (streamMessage?.message?.id && streamMessage.message.id !== dbMessage.id) {
        // Note: You might want to add an update method to store Stream message ID
        // For now, we'll use the DB ID as primary
      }

      return {
        id: dbMessage.id,
        senderId: dbMessage.senderId,
        receiverId: dbMessage.receiverId,
        content: dbMessage.content,
        read: dbMessage.read,
        createdAt: dbMessage.createdAt,
        updatedAt: dbMessage.updatedAt,
      };
    } catch (error) {
      console.error("Error creating message:", error);
      throw error instanceof Error ? error : new Error("Failed to create message");
    }
  }

  async getAllMessagesByUserId(userId: string): Promise<IMessage[]> {
    try {
      if (!userId) {
        throw new Error("User ID is required");
      }

      // Get messages from database (primary source of truth)
      const dbMessages = await this.messageDataSource.fetchAllByUserId(userId);

      // Also try to sync with Stream channels for any missing messages
      try {
        const channels = await streamService.queryUserChannels(userId);
        
        // Merge Stream messages with DB messages
        // For now, we'll prioritize DB messages as they're our source of truth
        // In a production system, you might want to implement a sync mechanism
      } catch (streamError) {
        console.warn("Error syncing with Stream channels:", streamError);
        // Continue with DB messages only
      }

      return dbMessages;
    } catch (error) {
      console.error("Error getting messages:", error);
      throw error instanceof Error ? error : new Error("Failed to get messages");
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

      // Get messages from database (primary source of truth)
      const dbMessages = await this.messageDataSource.fetchConversation(
        senderId,
        receiverId
      );

      // Optionally sync with Stream for real-time messages
      // In production, you might want to implement a background sync job
      try {
        const channel = await streamService.getOrCreateUserChannel(
          senderId,
          receiverId
        );

        if (channel && channel.id) {
          // Stream messages are already in DB, but we can use this for real-time updates
          // The mobile client will use Stream SDK for real-time, backend uses DB for persistence
        }
      } catch (streamError) {
        console.warn("Error syncing with Stream channel:", streamError);
        // Continue with DB messages
      }

      return dbMessages;
    } catch (error) {
      console.error("Error getting conversation:", error);
      throw error instanceof Error ? error : new Error("Failed to get conversation");
    }
  }

  async markMessageAsRead(messageId: string): Promise<void> {
    try {
      // Mark as read in database
      await this.messageDataSource.markAsRead(messageId);
      
      // Stream also handles read receipts on the client side
      // The mobile client will sync read status through Stream SDK
    } catch (error) {
      console.error("Error marking message as read:", error);
      throw error instanceof Error ? error : new Error("Failed to mark message as read");
    }
  }

  async getAllNotificationsByUserId(userId: string): Promise<INotification[]> {
    return await this.notificationDataSource.fetchAllByUserId(userId);
  }

  async markNotificationAsRead(notificationId: string): Promise<void> {
    await this.notificationDataSource.markAsRead(notificationId);
  }
}

export default MessageService;
