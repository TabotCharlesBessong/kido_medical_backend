import { DataTypes } from "sequelize";
import Db from "../database";
import { INotificationModel } from "../interfaces/notification.interface";
import { v4 as uuidv4 } from "uuid";
import UserModel from "./user.model";
import { NotificationType } from "../interfaces/enum/notification.enum";

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
        NotificationType.MESSAGE,
        NotificationType.APPOINTMENT,
        NotificationType.PRESCRIPTION
      ),
      allowNull: false,
    },
    referenceId: {
      type: DataTypes.UUID,
      allowNull: true,
      comment: "ID of the related entity (message, appointment, prescription)",
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

export default NotificationModel;
