import { Model, Optional } from "sequelize";

export interface IMessage {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IMessageCreationBody
  extends Optional<IMessage, "id" | "createdAt" | "updatedAt" | "read"> {}

export interface IMessageModel
  extends Model<IMessage, IMessageCreationBody>,
    IMessage {}

export interface IMessageDataSource {
  create(record: IMessageCreationBody): Promise<IMessage>;
  fetchAllByUserId(userId: string): Promise<IMessage[]>;
  fetchConversation(senderId: string, receiverId: string): Promise<IMessage[]>;
  markAsRead(messageId: string): Promise<void>;
}
