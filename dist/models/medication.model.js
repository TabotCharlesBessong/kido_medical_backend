"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../database"));
const doctor_enum_1 = require("../interfaces/enum/doctor.enum");
const prescription_model_1 = __importDefault(require("./prescription.model"));
const MedicationModel = database_1.default.define("Medication", {
    id: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        primaryKey: true,
    },
    prescriptionId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
    },
    name: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    dosage: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    frequency: {
        type: sequelize_1.DataTypes.ENUM(doctor_enum_1.Frequency.ONCE_A_DAY, doctor_enum_1.Frequency.TWICE_A_DAY, doctor_enum_1.Frequency.THRICE_A_DAY),
        allowNull: false,
    },
    duration: {
        type: sequelize_1.DataTypes.INTEGER,
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
    tableName: "medications",
    createdAt: "createdAt",
    updatedAt: "updatedAt",
});
MedicationModel.belongsTo(prescription_model_1.default, { foreignKey: "prescriptionId" });
prescription_model_1.default.hasMany(MedicationModel, { foreignKey: "prescriptionId" });
exports.default = MedicationModel;
