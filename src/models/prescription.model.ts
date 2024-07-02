import { DataTypes } from "sequelize";
import Db from "../database"
import { IPrescriptionModel } from "../interfaces/prescription.interface"

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
    },
    instructions: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    investigation: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    medications: {
      type: DataTypes.JSON,
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
    tableName: "prescriptions",
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  }
);

export default PrescriptionModel