import { QueryInterface, DataTypes } from 'sequelize';

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    await queryInterface.createTable('reminders', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      appointmentId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'appointments',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      recipientId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      recipientType: {
        type: DataTypes.ENUM('DOCTOR', 'PATIENT'),
        allowNull: false,
      },
      reminderType: {
        type: DataTypes.ENUM('30_MINUTES', '10_MINUTES'),
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM('PENDING', 'SENT', 'FAILED'),
        allowNull: false,
        defaultValue: 'PENDING',
      },
      scheduledFor: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    });

    // Add indexes
    await queryInterface.addIndex('reminders', ['appointmentId']);
    await queryInterface.addIndex('reminders', ['recipientId']);
    await queryInterface.addIndex('reminders', ['status', 'scheduledFor']);
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.dropTable('reminders');
  },
};