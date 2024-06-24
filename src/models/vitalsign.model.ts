import { DataTypes } from "sequelize";
import Db from "../database";
import { IVitalSign, IVitalSignModel } from "../interfaces/vitalsign.interface";
import { v4 as uuidv4 } from "uuid";
import PatientModel from "./patient.model";
import DoctorModel from "./doctor.model";
import AppointmentModel from "./appointment.model";

const VitalSignModel = Db.define<IVitalSignModel>(
  "VitalSignModel",
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
        key: "userId",
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
    appointmentId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: AppointmentModel,
        key: "id",
      },
    },
    weight: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    height: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    bloodPressure: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    pulse: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    respiratoryRate: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    temperature: {
      type: DataTypes.FLOAT,
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
    tableName: "vitalsigns",
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  }
);

PatientModel.hasMany(VitalSignModel, {
  foreignKey: "patientId",
  as: "patientVitalSigns",
});
VitalSignModel.belongsTo(PatientModel, {
  foreignKey: "patientId",
});

DoctorModel.hasMany(VitalSignModel, {
  foreignKey: "doctorId",
  as: "doctorPatientsSigns",
});
VitalSignModel.belongsTo(DoctorModel, {
  foreignKey: "doctorId",
});

export default VitalSignModel;
