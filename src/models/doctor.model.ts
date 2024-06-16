import { DataTypes } from "sequelize";
import Db from "../database";
import UserModel from "./user.model";
import { IDoctorModel } from "../interfaces/doctor.interface";

const DoctorModel = Db.define<IDoctorModel>(
  "Doctor",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      unique:true,
      references: {
        model: UserModel,
        key: "id",
      },
    },
    specialization: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    verificationStatus: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "PENDING",
    },
    documents: {
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
    tableName: "doctors",
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  }
);

UserModel.hasOne(DoctorModel, {
  foreignKey: "userId",
  as: "doctor",
});
DoctorModel.belongsTo(UserModel, {
  foreignKey: "userId",
});

export default DoctorModel;
