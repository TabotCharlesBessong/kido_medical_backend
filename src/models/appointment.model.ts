import { DataTypes } from "sequelize";
import Db from "../database";
import { IAppointmentModel } from "../interfaces/appointment.interface";
import { v4 as uuidv4 } from "uuid";
import PatientModel from "./patient.model";
import DoctorModel from "./doctor.model";
import { AppointmentStatus } from "../interfaces/enum/patient.enum";

const AppointmentModel = Db.define<IAppointmentModel>(
  "AppointmentModel",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: () => uuidv4(),
      allowNull: false,
      primaryKey: true,
    },
    patientId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: PatientModel,
        key: "userId",
      },
    },
    doctorId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: DoctorModel,
        key: "id",
      },
    },
    timeslotId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    reason: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    staus: {
      type: DataTypes.ENUM("PENDING", "APPROVED", "CANCELED"),
      allowNull: false,
      defaultValue: AppointmentStatus.PENDING,
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
    tableName: "appointments",
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  }
);

PatientModel.hasMany(AppointmentModel, {
  foreignKey: "patientId",
  as: "patientAppointments",
});
AppointmentModel.belongsTo(PatientModel, {
  foreignKey: "patientId",
});

DoctorModel.hasMany(AppointmentModel, {
  foreignKey: "doctorId",
  as: "doctorAppointments",
});
AppointmentModel.belongsTo(DoctorModel, {
  foreignKey: "doctorId",
});

export default AppointmentModel;
