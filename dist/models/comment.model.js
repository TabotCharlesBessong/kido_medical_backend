"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../database"));
const uuid_1 = require("uuid");
const user_model_1 = __importDefault(require("./user.model"));
const post_model_1 = __importDefault(require("./post.model"));
const CommentModel = database_1.default.define("CommentModel", {
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
    content: {
        type: sequelize_1.DataTypes.TEXT,
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
    tableName: "comments",
    createdAt: "createdAt",
    updatedAt: "updatedAt",
});
post_model_1.default.hasMany(CommentModel, {
    foreignKey: "postId",
    as: "postComments"
});
CommentModel.belongsTo(post_model_1.default, {
    foreignKey: "postId",
    as: "commentPost"
});
user_model_1.default.hasOne(CommentModel, {
    foreignKey: "userId",
    as: "userComment",
});
CommentModel.belongsTo(user_model_1.default, {
    foreignKey: "userId",
    as: "commentUser"
});
exports.default = CommentModel;
