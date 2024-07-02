"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../database"));
const uuid_1 = require("uuid");
const post_model_1 = __importDefault(require("./post.model"));
const user_model_1 = __importDefault(require("./user.model"));
const LikeModel = database_1.default.define("LikeModel", {
    id: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: () => (0, uuid_1.v4)(),
        allowNull: false,
        primaryKey: true,
    },
    postId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        references: {
            model: post_model_1.default,
            key: "id",
        },
    },
    userId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        references: {
            model: user_model_1.default,
            key: "id",
        },
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
    tableName: "likes",
    createdAt: "createdAt",
    updatedAt: "updatedAt",
});
post_model_1.default.hasMany(LikeModel, {
    foreignKey: "postId",
    as: "postLikes",
});
LikeModel.belongsTo(post_model_1.default, {
    foreignKey: "postId",
    as: "likePost"
});
user_model_1.default.hasOne(LikeModel, {
    foreignKey: "userId",
    as: "userLikes",
});
LikeModel.belongsTo(user_model_1.default, {
    foreignKey: "userId",
    as: "likeUser"
});
exports.default = LikeModel;
