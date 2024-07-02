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
const appointment_model_1 = __importDefault(require("./appointment.model"));
const VitalSignModel = database_1.default.define("VitalSignModel", {
    id: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: () => (0, uuid_1.v4)(),
        allowNull: false,
        primaryKey: true,
    },
    patientId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        references: {
            model: patient_model_1.default,
            key: "id",
        },
    },
    doctorId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        references: {
            model: doctor_model_1.default,
            key: "userId",
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
    weight: {
        type: sequelize_1.DataTypes.FLOAT,
        allowNull: false,
    },
    height: {
        type: sequelize_1.DataTypes.FLOAT,
        allowNull: false,
    },
    bloodPressure: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    pulse: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
    },
    respiratoryRate: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
    },
    temperature: {
        type: sequelize_1.DataTypes.FLOAT,
        allowNull: false,
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
    tableName: "vitalsigns",
    createdAt: "createdAt",
    updatedAt: "updatedAt",
});
patient_model_1.default.hasMany(VitalSignModel, {
    foreignKey: "patientId",
    as: "patientVitalSigns",
});
VitalSignModel.belongsTo(patient_model_1.default, {
    foreignKey: "patientId",
});
doctor_model_1.default.hasMany(VitalSignModel, {
    foreignKey: "doctorId",
    as: "doctorPatientsSigns",
});
VitalSignModel.belongsTo(doctor_model_1.default, {
    foreignKey: "doctorId",
});
exports.default = VitalSignModel;
