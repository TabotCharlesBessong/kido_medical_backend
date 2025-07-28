"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
module.exports = {
    up: async (queryInterface) => {
        await queryInterface.createTable('reminders', {
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
        await queryInterface.addIndex('reminders', ['appointmentId']);
        await queryInterface.addIndex('reminders', ['recipientId']);
        await queryInterface.addIndex('reminders', ['status', 'scheduledFor']);
    },
    down: async (queryInterface) => {
        await queryInterface.dropTable('reminders');
    },
};
