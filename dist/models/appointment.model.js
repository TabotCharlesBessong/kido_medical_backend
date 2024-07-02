"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../database"));
const uuid_1 = require("uuid");
const patient_model_1 = __importDefault(require("./patient.model"));
const doctor_model_1 = __importDefault(require("./doctor.model"));
const patient_enum_1 = require("../interfaces/enum/patient.enum");
const AppointmentModel = database_1.default.define("AppointmentModel", {
    id: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: () => (0, uuid_1.v4)(),
        allowNull: false,
        primaryKey: true,
    },
    patientId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: true,
        references: {
            model: patient_model_1.default,
            key: "userId",
        },
    },
    doctorId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: true,
        references: {
            model: doctor_model_1.default,
            key: "id",
        },
    },
    timeslotId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
    },
    date: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
    },
    reason: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    staus: {
        type: sequelize_1.DataTypes.ENUM("PENDING", "APPROVED", "CANCELED"),
        allowNull: false,
        defaultValue: patient_enum_1.AppointmentStatus.PENDING,
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
    tableName: "appointments",
    createdAt: "createdAt",
    updatedAt: "updatedAt",
});
patient_model_1.default.hasMany(AppointmentModel, {
    foreignKey: "patientId",
    as: "patientAppointments",
});
AppointmentModel.belongsTo(patient_model_1.default, {
    foreignKey: "patientId",
});
doctor_model_1.default.hasMany(AppointmentModel, {
    foreignKey: "doctorId",
    as: "doctorAppointments",
});
AppointmentModel.belongsTo(doctor_model_1.default, {
    foreignKey: "doctorId",
});
exports.default = AppointmentModel;
