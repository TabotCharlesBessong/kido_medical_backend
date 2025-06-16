import { DataTypes } from "sequelize";
import Db from "../database";
import { IConsultationModel } from "../interfaces/consultation.interface";
import AppointmentModel from "./appointment.model";

const ConsultationModel = Db.define<IConsultationModel>(
  "ConsultationModel",
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    appointmentId: {
      type: DataTypes.UUID,
      allowNull: false,
      references:{
        model:AppointmentModel,
        key:"id"
      }
    },
    presentingComplaints: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    pastHistory: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    diagnosticImpression: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    investigations: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    treatment: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    timestamps: true,
    tableName: "consultations",
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  }
);

AppointmentModel.hasOne(ConsultationModel,{
  foreignKey:"appointmentId",
  as:"appointmentConsultation"
})
ConsultationModel.belongsTo(AppointmentModel,{
  foreignKey:"appointmentId"
})

export default ConsultationModel