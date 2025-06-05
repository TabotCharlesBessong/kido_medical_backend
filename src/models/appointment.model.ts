import { DataTypes } from "sequelize";
import Db from "../database";
import { IAppointmentModel } from "../interfaces/appointment.interface";
import { v4 as uuidv4 } from "uuid";
import PatientModel from "./patient.model";
import DoctorModel from "./doctor.model";
import TimeSlotModel from "./timeslot.model";
import { AppointmentStatus } from "../interfaces/enum/patient.enum";

const AppointmentModel = Db.define<IAppointmentModel>(
  "Appointment",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: () => uuidv4(),
      allowNull: false,
      primaryKey: true,
    },
    patientId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: PatientModel,
        key: "id",
      },
    },
    doctorId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: DoctorModel,
        key: "id",
      },
    },
    timeslotId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: TimeSlotModel,
        key: "id",
      },
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    reason: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM(...Object.values(AppointmentStatus)),
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
  as: "appointments",
});
AppointmentModel.belongsTo(PatientModel, {
  foreignKey: "patientId",
  as: "patient",
});

DoctorModel.hasMany(AppointmentModel, {
  foreignKey: "doctorId",
  as: "appointments",
});
AppointmentModel.belongsTo(DoctorModel, {
  foreignKey: "doctorId",
  as: "doctor",
});

TimeSlotModel.hasMany(AppointmentModel, {
  foreignKey: "timeslotId",
  as: "appointments",
});
AppointmentModel.belongsTo(TimeSlotModel, {
  foreignKey: "timeslotId",
  as: "timeslot",
});

export default AppointmentModel;
