"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../database"));
const user_model_1 = __importDefault(require("./user.model"));
const DoctorModel = database_1.default.define("Doctor", {
    id: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        primaryKey: true,
    },
    userId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        unique: true,
        references: {
            model: user_model_1.default,
            key: "id",
        },
    },
    specialization: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    verificationStatus: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        defaultValue: "PENDING",
    },
    documents: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
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
    tableName: "doctors",
    createdAt: "createdAt",
    updatedAt: "updatedAt",
});
user_model_1.default.hasOne(DoctorModel, {
    foreignKey: "userId",
    as: "doctor",
});
DoctorModel.belongsTo(user_model_1.default, {
    foreignKey: "userId",
});
exports.default = DoctorModel;
