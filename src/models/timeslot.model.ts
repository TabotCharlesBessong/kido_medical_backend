import { DataTypes } from "sequelize";
import Db from "../database";
import DoctorModel from "./doctor.model";
import { ITimeSlotModel } from "../interfaces/timeslot.interface";

const TimeSlotModel = Db.define<ITimeSlotModel>(
  "TimeSlot",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    doctorId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: DoctorModel,
        key: "userId",
      },
    },
    startTime: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    endTime: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    isAvailable: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
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
    tableName: "timeslots",
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  }
);

DoctorModel.hasMany(TimeSlotModel, {
  foreignKey: "doctorId",
  as: "timeSlots",
});
TimeSlotModel.belongsTo(DoctorModel, {
  foreignKey: "doctorId",
});

export default TimeSlotModel;
