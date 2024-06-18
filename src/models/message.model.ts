import { DataTypes } from "sequelize";
import Db from "../database";
import { IMessageModel } from "../interfaces/message.interface";
import { v4 as uuidv4 } from "uuid";
import UserModel from "./user.model";

const MessageModel = Db.define<IMessageModel>(
  "MessageModel",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: uuidv4,
      allowNull: false,
      primaryKey: true,
    },
    senderId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: UserModel,
        key: "id",
      },
    },
    receiverId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: UserModel,
        key: "id",
      },
    },
    content: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    read: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false,
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false,
    },
  },
  {
    timestamps: true,
    tableName: "messages",
  }
);

UserModel.hasMany(MessageModel, {
  foreignKey: "senderId",
  as: "sentMessages",
});
MessageModel.belongsTo(UserModel, {
  foreignKey: "senderId",
  as: "sender",
});

UserModel.hasMany(MessageModel, {
  foreignKey: "receiverId",
  as: "receivedMessages",
});
MessageModel.belongsTo(UserModel, {
  foreignKey: "receiverId",
  as: "receiver",
});

export default MessageModel;
