"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../database"));
const uuid_1 = require("uuid");
const user_model_1 = __importDefault(require("./user.model"));
const message_model_1 = __importDefault(require("./message.model"));
const appointment_model_1 = __importDefault(require("./appointment.model"));
const NotificationModel = database_1.default.define("NotificationModel", {
    id: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: uuid_1.v4,
        allowNull: false,
        primaryKey: true,
    },
    userId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        references: {
            model: user_model_1.default,
            key: "id",
        },
    },
    messageId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: true,
        references: {
            model: message_model_1.default,
            key: "id",
        },
    },
    appointmentId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: true,
        references: {
            model: appointment_model_1.default,
            key: "id",
        },
    },
    message: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    read: {
        type: sequelize_1.DataTypes.BOOLEAN,
        defaultValue: false,
    },
    type: {
        type: sequelize_1.DataTypes.ENUM("MESSAGE", "APPOINTMENT_SCHEDULED", "APPOINTMENT_APPROVED", "APPOINTMENT_CANCELLED"),
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
    tableName: "notifications",
    createdAt: "createdAt",
    updatedAt: "updatedAt",
});
user_model_1.default.hasMany(NotificationModel, {
    foreignKey: "userId",
    as: "notifications",
});
NotificationModel.belongsTo(user_model_1.default, {
    foreignKey: "userId",
});
message_model_1.default.hasOne(NotificationModel, {
    foreignKey: "messageId",
    as: "messageNotifications",
});
NotificationModel.belongsTo(message_model_1.default, {
    foreignKey: "messageId",
});
appointment_model_1.default.hasOne(NotificationModel, {
    foreignKey: "appointmentId",
    as: "appointmentNotifications",
});
NotificationModel.belongsTo(appointment_model_1.default, {
    foreignKey: "appointmentId",
});
exports.default = NotificationModel;
