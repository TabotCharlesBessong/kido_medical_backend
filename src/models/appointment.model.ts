import { Model, DataTypes } from "sequelize";
import Db from "../database";
import DoctorModel from "./doctor.model";
import PatientModel from "./patient.model";
import TimeSlotModel from "./timeslot.model";

class AppointmentModel extends Model {
  public id!: string;
  public doctorId!: string;
  public patientId!: string;
  public timeSlotId!: string;
  public status!: "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED";
  public streamChannelId?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

AppointmentModel.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    doctorId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: DoctorModel,
        key: "id",
      },
    },
    patientId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: PatientModel,
        key: "id",
      },
    },
    timeSlotId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: TimeSlotModel,
        key: "id",
      },
    },
    status: {
      type: DataTypes.ENUM("PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"),
      defaultValue: "PENDING",
    },
    streamChannelId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize: Db,
    modelName: "Appointment",
    tableName: "appointments",
  }
);

// Define relationships
AppointmentModel.belongsTo(DoctorModel, {
  foreignKey: "doctorId",
  as: "doctor",
});

AppointmentModel.belongsTo(PatientModel, {
  foreignKey: "patientId",
  as: "patient",
});

AppointmentModel.belongsTo(TimeSlotModel, {
  foreignKey: "timeSlotId",
  as: "timeSlot",
});

export default AppointmentModel;
