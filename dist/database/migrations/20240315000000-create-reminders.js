"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
module.exports = {
    up: (queryInterface) => __awaiter(void 0, void 0, void 0, function* () {
        yield queryInterface.createTable('reminders', {
            id: {
                type: sequelize_1.DataTypes.UUID,
                defaultValue: sequelize_1.DataTypes.UUIDV4,
                primaryKey: true,
            },
            appointmentId: {
                type: sequelize_1.DataTypes.UUID,
                allowNull: false,
                references: {
                    model: 'appointments',
                    key: 'id',
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE',
            },
            recipientId: {
                type: sequelize_1.DataTypes.UUID,
                allowNull: false,
            },
            recipientType: {
                type: sequelize_1.DataTypes.ENUM('DOCTOR', 'PATIENT'),
                allowNull: false,
            },
            reminderType: {
                type: sequelize_1.DataTypes.ENUM('30_MINUTES', '10_MINUTES'),
                allowNull: false,
            },
            status: {
                type: sequelize_1.DataTypes.ENUM('PENDING', 'SENT', 'FAILED'),
                allowNull: false,
                defaultValue: 'PENDING',
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
        });
        // Add indexes
        yield queryInterface.addIndex('reminders', ['appointmentId']);
        yield queryInterface.addIndex('reminders', ['recipientId']);
        yield queryInterface.addIndex('reminders', ['status', 'scheduledFor']);
    }),
    down: (queryInterface) => __awaiter(void 0, void 0, void 0, function* () {
        yield queryInterface.dropTable('reminders');
    }),
};
