import { DataTypes } from "sequelize";
import Db from "../database"
import { IPrescriptionModel } from "../interfaces/prescription.interface"
import ConsultationModel from "./consultation.model"

const PrescriptionModel = Db.define<IPrescriptionModel>(
  "PrescriptionModel",
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    consultationId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: ConsultationModel,
        key: "id"
      }
    },
    instructions: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    investigation: {
      type: DataTypes.TEXT,
      allowNull: true,
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
    tableName: "prescriptions",
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  }
);

// Set up the relationship with consultation
ConsultationModel.hasMany(PrescriptionModel, {
  foreignKey: "consultationId",
  as: "prescriptions"
});

PrescriptionModel.belongsTo(ConsultationModel, {
  foreignKey: "consultationId",
  as: "consultation"
});

export default PrescriptionModel