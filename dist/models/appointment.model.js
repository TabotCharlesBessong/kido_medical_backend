"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../database"));
const doctor_model_1 = __importDefault(require("./doctor.model"));
const patient_model_1 = __importDefault(require("./patient.model"));
const timeslot_model_1 = __importDefault(require("./timeslot.model"));
class AppointmentModel extends sequelize_1.Model {
}
AppointmentModel.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
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
    timeSlotId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        references: {
            model: timeslot_model_1.default,
            key: "id",
        },
    },
    status: {
        type: sequelize_1.DataTypes.ENUM("PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"),
        defaultValue: "PENDING",
    },
    streamChannelId: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
}, {
    sequelize: database_1.default,
    modelName: "Appointment",
    tableName: "appointments",
});
// Define relationships
AppointmentModel.belongsTo(doctor_model_1.default, {
    foreignKey: "doctorId",
    as: "doctor",
});
AppointmentModel.belongsTo(patient_model_1.default, {
    foreignKey: "patientId",
    as: "patient",
});
AppointmentModel.belongsTo(timeslot_model_1.default, {
    foreignKey: "timeSlotId",
    as: "timeSlot",
});
exports.default = AppointmentModel;
