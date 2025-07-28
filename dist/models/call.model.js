"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../database"));
const uuid_1 = require("uuid");
const doctor_model_1 = __importDefault(require("./doctor.model"));
const patient_model_1 = __importDefault(require("./patient.model"));
const appointment_model_1 = __importDefault(require("./appointment.model"));
const CallModel = database_1.default.define("CallModel", {
    id: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: () => (0, uuid_1.v4)(),
        allowNull: false,
        primaryKey: true,
    },
    doctorId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        references: {
            model: doctor_model_1.default,
            key: "id",
        },
    },
    patientId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        references: {
            model: patient_model_1.default,
            key: "id",
        },
    },
    appointmentId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        references: {
            model: appointment_model_1.default,
            key: "id",
        },
    },
    streamCallId: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    status: {
        type: sequelize_1.DataTypes.ENUM("PENDING", "ACTIVE", "COMPLETED", "FAILED"),
        allowNull: false,
        defaultValue: "PENDING",
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
    tableName: "calls",
    createdAt: "createdAt",
    updatedAt: "updatedAt",
});
doctor_model_1.default.hasMany(CallModel, { foreignKey: "doctorId", as: "doctorCalls" });
CallModel.belongsTo(doctor_model_1.default, { foreignKey: "doctorId" });
patient_model_1.default.hasMany(CallModel, {
    foreignKey: "patientId",
    as: "patientCalls",
});
CallModel.belongsTo(patient_model_1.default, { foreignKey: "patientId" });
appointment_model_1.default.hasMany(CallModel, { foreignKey: "appointmentId", as: "appointmentCalls" });
CallModel.belongsTo(appointment_model_1.default, { foreignKey: "appointmentId" });
exports.default = CallModel;
