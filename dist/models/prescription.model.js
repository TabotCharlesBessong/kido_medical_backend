"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../database"));
const PrescriptionModel = database_1.default.define("PrescriptionModel", {
    id: {
        type: sequelize_1.DataTypes.UUID,
        primaryKey: true,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
    },
    consultationId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
    },
    instructions: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
    investigation: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
    medications: {
        type: sequelize_1.DataTypes.JSON,
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
    tableName: "prescriptions",
    createdAt: "createdAt",
    updatedAt: "updatedAt",
});
exports.default = PrescriptionModel;
