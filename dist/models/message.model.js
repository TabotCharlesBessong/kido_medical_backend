"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../database"));
const uuid_1 = require("uuid");
const user_model_1 = __importDefault(require("./user.model"));
const MessageModel = database_1.default.define("MessageModel", {
    id: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: uuid_1.v4,
        allowNull: false,
        primaryKey: true,
    },
    senderId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        references: {
            model: user_model_1.default,
            key: "id",
        },
    },
    receiverId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        references: {
            model: user_model_1.default,
            key: "id",
        },
    },
    content: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    read: {
        type: sequelize_1.DataTypes.BOOLEAN,
        defaultValue: false,
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
    tableName: "messages",
    createdAt: "createdAt",
    updatedAt: "updatedAt",
});
user_model_1.default.hasMany(MessageModel, {
    foreignKey: "senderId",
    as: "sentMessages",
});
MessageModel.belongsTo(user_model_1.default, {
    foreignKey: "senderId",
    as: "sender",
});
user_model_1.default.hasMany(MessageModel, {
    foreignKey: "receiverId",
    as: "receivedMessages",
});
MessageModel.belongsTo(user_model_1.default, {
    foreignKey: "receiverId",
    as: "receiver",
});
exports.default = MessageModel;
