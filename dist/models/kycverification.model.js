"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../database"));
const user_model_1 = __importDefault(require("./user.model"));
class KycVerification extends sequelize_1.Model {
}
KycVerification.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
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
    documentType: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    documentUrl: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    specialistDocumentUrl: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    status: {
        type: sequelize_1.DataTypes.ENUM("pending", "approved", "rejected"),
        defaultValue: "pending",
    },
    reason: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
}, {
    sequelize: database_1.default,
    modelName: "KycVerification",
    tableName: "kyc_verifications",
    timestamps: true,
});
// Many-to-one relationship: Many KycVerifications belong to one User
KycVerification.belongsTo(user_model_1.default, { foreignKey: "userId", as: "user" });
user_model_1.default.hasMany(KycVerification, {
    foreignKey: "userId",
    as: "kycVerifications",
});
exports.default = KycVerification;
