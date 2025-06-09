"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../database"));
const appointment_model_1 = __importDefault(require("./appointment.model"));
const ConsultationModel = database_1.default.define("ConsultationModel", {
    id: {
        type: sequelize_1.DataTypes.UUID,
        primaryKey: true,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
    },
    appointmentId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        references: {
            model: appointment_model_1.default,
            key: "id"
        }
    },
    presentingComplaints: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: false,
    },
    pastHistory: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    diagnosticImpression: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: false,
    },
    investigations: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    treatment: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    createdAt: {
        type: sequelize_1.DataTypes.DATE,
        defaultValue: sequelize_1.DataTypes.NOW,
    },
    updatedAt: {
        type: sequelize_1.DataTypes.DATE,
        defaultValue: sequelize_1.DataTypes.NOW,
    },
}, {
    timestamps: true,
    tableName: "consultations",
    createdAt: "createdAt",
    updatedAt: "updatedAt",
});
appointment_model_1.default.hasOne(ConsultationModel, {
    foreignKey: "appointmentId",
    as: "appointmentConsultation"
});
ConsultationModel.belongsTo(appointment_model_1.default, {
    foreignKey: "appointmentId"
});
exports.default = ConsultationModel;
