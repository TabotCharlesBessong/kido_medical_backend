import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../database";
import { IReminder, IReminderCreationBody } from "../interfaces/reminder.interface";
import AppointmentModel from "./appointment.model";

class ReminderModel extends Model<IReminder, IReminderCreationBody> implements IReminder {
  public id!: string;
  public appointmentId!: string;
  public recipientId!: string;
  public recipientType!: "DOCTOR" | "PATIENT";
  public reminderType!: "30_MINUTES" | "10_MINUTES";
  public status!: "PENDING" | "SENT" | "FAILED";
  public scheduledFor!: Date;
  public createdAt!: Date;
  public updatedAt!: Date;
}

ReminderModel.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    appointmentId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: AppointmentModel,
        key: "id",
      },
    },
    recipientId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    recipientType: {
      type: DataTypes.ENUM("DOCTOR", "PATIENT"),
      allowNull: false,
    },
    reminderType: {
      type: DataTypes.ENUM("30_MINUTES", "10_MINUTES"),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("PENDING", "SENT", "FAILED"),
      allowNull: false,
      defaultValue: "PENDING",
    },
    scheduledFor: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: "Reminder",
    tableName: "reminders",
  }
);

// Define associations
ReminderModel.belongsTo(AppointmentModel, {
  foreignKey: "appointmentId",
  as: "appointment",
});

export default ReminderModel;