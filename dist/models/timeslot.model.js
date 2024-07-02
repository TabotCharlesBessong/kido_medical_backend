"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../database"));
const doctor_model_1 = __importDefault(require("./doctor.model"));
const uuid_1 = require("uuid");
const TimeSlotModel = database_1.default.define("TimeSlot", {
    id: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: () => (0, uuid_1.v4)(),
        primaryKey: true,
    },
    doctorId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: true,
        references: {
            model: doctor_model_1.default,
            key: "userId",
        },
    },
    startTime: {
        type: sequelize_1.DataTypes.TIME,
        allowNull: false,
    },
    endTime: {
        type: sequelize_1.DataTypes.TIME,
        allowNull: false,
    },
    isAvailable: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
    },
    createdAt: {
        type: sequelize_1.DataTypes.DATE,
        defaultValue: sequelize_1.DataTypes.NOW,
        allowNull: false,
    },
    updatedAt: {
        type: sequelize_1.DataTypes.DATE,
        defaultValue: sequelize_1.DataTypes.NOW,
        allowNull: false,
    },
}, {
    timestamps: true,
    tableName: "timeslots",
    createdAt: "createdAt",
    updatedAt: "updatedAt",
});
doctor_model_1.default.hasMany(TimeSlotModel, {
    foreignKey: "doctorId",
    as: "timeSlots",
});
TimeSlotModel.belongsTo(doctor_model_1.default, {
    foreignKey: "doctorId",
});
exports.default = TimeSlotModel;
