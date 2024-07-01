import { Model, DataTypes } from "sequelize";
import sequelize from "../database";
import {
  IMedicationModel,
} from "../interfaces/medication.interface";
import { Frequency } from "../interfaces/enum/doctor.enum";
import PrescriptionModel from "./prescription.model";

const MedicationModel = sequelize.define<IMedicationModel>(
  "Medication",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    prescriptionId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    dosage: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    frequency: {
      type: DataTypes.ENUM(
        Frequency.ONCE_A_DAY,
        Frequency.TWICE_A_DAY,
        Frequency.THRICE_A_DAY
      ),
      allowNull: false,
    },
    duration: {
      type: DataTypes.INTEGER,
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
    tableName: "medications",
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  }
);

MedicationModel.belongsTo(PrescriptionModel, { foreignKey: "prescriptionId" });
PrescriptionModel.hasMany(MedicationModel, { foreignKey: "prescriptionId" });

export default MedicationModel;
