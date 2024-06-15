import { DataTypes } from "sequelize";
import Db from "../database";
import DoctorModel from "./doctor.model";
import { ITimeSlotModel } from "../interfaces/timeslot.interface";
import {v4 as uuidv4} from "uuid"

const TimeSlotModel = Db.define<ITimeSlotModel>(
  "TimeSlot",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: () => uuidv4(),
      primaryKey: true,
    },
    doctorId: {
      type: DataTypes.STRING,
      allowNull: true,
      references: {
        model: DoctorModel,
        key: "userId",
      },
    },
    startTime: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    endTime: {
      type: DataTypes.TIME,
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
