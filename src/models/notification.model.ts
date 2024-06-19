import { DataTypes } from "sequelize";
import Db from "../database";
import { INotificationModel } from "../interfaces/notification.interface";
import { v4 as uuidv4 } from "uuid";
import UserModel from "./user.model";
import MessageModel from "./message.model";
import AppointmentModel from "./appointment.model";

const NotificationModel = Db.define<INotificationModel>(
  "NotificationModel",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: uuidv4,
      allowNull: false,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: UserModel,
        key: "id",
      },
    },
    messageId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: MessageModel,
        key: "id",
      },
    },
    appointmentId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: AppointmentModel,
        key: "id",
      },
    },
    message: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    read: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    type: {
      type: DataTypes.ENUM(
        "MESSAGE",
        "APPOINTMENT_SCHEDULED",
        "APPOINTMENT_APPROVED",
        "APPOINTMENT_CANCELLED"
      ),
      allowNull: false,
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
    tableName: "notifications",
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  }
);

UserModel.hasMany(NotificationModel, {
  foreignKey: "userId",
  as: "notifications",
});
NotificationModel.belongsTo(UserModel, {
  foreignKey: "userId",
});

MessageModel.hasOne(NotificationModel, {
  foreignKey: "messageId",
  as: "messageNotifications",
});
NotificationModel.belongsTo(MessageModel, {
  foreignKey: "messageId",
});

AppointmentModel.hasOne(NotificationModel, {
  foreignKey: "appointmentId",
  as: "appointmentNotifications",
});
NotificationModel.belongsTo(AppointmentModel, {
  foreignKey: "appointmentId",
});

export default NotificationModel;
