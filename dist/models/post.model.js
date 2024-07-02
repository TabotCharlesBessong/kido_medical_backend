"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../database"));
const uuid_1 = require("uuid");
const doctor_model_1 = __importDefault(require("./doctor.model"));
const PostModel = database_1.default.define("PostModel", {
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
            key: "userId",
        },
    },
    title: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    image: {
        type: sequelize_1.DataTypes.STRING,
    },
    description: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: false,
    },
    likesCount: {
        type: sequelize_1.DataTypes.INTEGER,
        defaultValue: 0,
    },
    status: {
        type: sequelize_1.DataTypes.STRING,
        defaultValue: "ACTIVE",
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
    tableName: "posts",
    createdAt: "createdAt",
    updatedAt: "updatedAt",
});
doctor_model_1.default.hasMany(PostModel, {
    foreignKey: "doctorId",
    as: "doctorPosts"
});
PostModel.belongsTo(doctor_model_1.default, {
    foreignKey: "doctorId",
    as: "postDoctor"
});
exports.default = PostModel;
