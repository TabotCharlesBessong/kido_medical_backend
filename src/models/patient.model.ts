import { DataTypes } from "sequelize";
import Db from "../database";
import { IPatientModel } from "../interfaces/patient.interface";
import { v4 as uuidv4 } from "uuid";
import UserModel from "./user.model";

const PatientModel = Db.define<IPatientModel>(
  "PatientModel",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
      references: {
        model: UserModel,
        key: "id",
      },
    },
    gender: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    age: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    address1: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    address2: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    occupation: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    phoneNumber: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    tribe: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    religion: {
      type: DataTypes.STRING,
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
    tableName: "patients",
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  }
);

UserModel.hasOne(PatientModel, {
  foreignKey: "userId",
  as: "patient",
});
PatientModel.belongsTo(UserModel, {
  foreignKey: "userId",
  as:"users"
});

export default PatientModel;
