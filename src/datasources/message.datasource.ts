import { Op } from "sequelize";
import {
  IMessage,
  IMessageCreationBody,
  IMessageDataSource,
} from "../interfaces/message.interface";
import MessageModel from "../models/message.model";
import UserModel from "../models/user.model";

class MessageDataSource implements IMessageDataSource {
  async create(record: IMessageCreationBody): Promise<IMessage> {
    return await MessageModel.create(record);
  }

  async fetchAllByUserId(userId: string): Promise<IMessage[]> {
    return await MessageModel.findAll({
      where: { [Op.or]: [{ senderId: userId }, { receiverId: userId }] },
      include: [
        { model: UserModel, as: "sender" },
        { model: UserModel, as: "receiver" },
      ],
    });
  }

  async fetchConversation(
    senderId: string,
    receiverId: string
  ): Promise<IMessage[]> {
    return await MessageModel.findAll({
      where: {
        [Op.or]: [
          { senderId, receiverId },
          { senderId: receiverId, receiverId: senderId },
        ],
      },
      include: [
        { model: UserModel, as: "sender" },
        { model: UserModel, as: "receiver" },
      ],
    });
  }

  async markAsRead(messageId: string): Promise<void> {
    await MessageModel.update({ read: true }, { where: { id: messageId } });
  }
}

export default MessageDataSource;
