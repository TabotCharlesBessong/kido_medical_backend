import { DataTypes } from "sequelize";
import Db from "../database";
import { ICallModel } from "../interfaces/call.interface";
import { v4 as uuidv4 } from "uuid";
import DoctorModel from "./doctor.model";
import PatientModel from "./patient.model";
import AppointmentModel from "./appointment.model";

const CallModel = Db.define<ICallModel>(
  "CallModel",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: () => uuidv4(),
      allowNull: false,
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
        key: "userId",
      },
    },
    appointmentId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: AppointmentModel,
        key: "id",
      },
    },
    status: {
      type: DataTypes.ENUM("PENDING", "COMPLETED", "FAILED"),
      allowNull: false,
      defaultValue: "PENDING",
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
    tableName: "calls",
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  }
);

DoctorModel.hasMany(CallModel, { foreignKey: "doctorId", as: "doctorCalls" });
CallModel.belongsTo(DoctorModel, { foreignKey: "doctorId" });

PatientModel.hasMany(CallModel, {
  foreignKey: "patientId",
  as: "patientCalls",
});
CallModel.belongsTo(PatientModel, { foreignKey: "patientId" });

AppointmentModel.hasOne(CallModel, {
  foreignKey: "appointmentId",
  as: "appointmentCall",
});
CallModel.belongsTo(AppointmentModel, { foreignKey: "appointmentId" });

export default CallModel;
