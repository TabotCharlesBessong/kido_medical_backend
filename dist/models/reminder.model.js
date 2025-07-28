"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../database"));
const appointment_model_1 = __importDefault(require("./appointment.model"));
class ReminderModel extends sequelize_1.Model {
}
ReminderModel.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        primaryKey: true,
    },
    appointmentId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        references: {
            model: appointment_model_1.default,
            key: "id",
        },
    },
    recipientId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
    },
    recipientType: {
        type: sequelize_1.DataTypes.ENUM("DOCTOR", "PATIENT"),
        allowNull: false,
    },
    reminderType: {
        type: sequelize_1.DataTypes.ENUM("30_MINUTES", "10_MINUTES"),
        allowNull: false,
    },
    status: {
        type: sequelize_1.DataTypes.ENUM("PENDING", "SENT", "FAILED"),
        allowNull: false,
        defaultValue: "PENDING",
    },
    scheduledFor: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
    },
    createdAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize_1.DataTypes.NOW,
    },
    updatedAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize_1.DataTypes.NOW,
    },
}, {
    sequelize: database_1.default,
    modelName: "Reminder",
    tableName: "reminders",
});
// Define associations
ReminderModel.belongsTo(appointment_model_1.default, {
    foreignKey: "appointmentId",
    as: "appointment",
});
exports.default = ReminderModel;
