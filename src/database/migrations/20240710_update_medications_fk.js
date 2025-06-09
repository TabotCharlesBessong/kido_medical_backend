module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Remove the existing foreign key constraint
    await queryInterface.removeConstraint('medications', 'medications_prescriptionId_fkey');
    // Add the new constraint with ON DELETE CASCADE
    await queryInterface.addConstraint('medications', {
      fields: ['prescriptionId'],
      type: 'foreign key',
      name: 'medications_prescriptionId_fkey',
      references: {
        table: 'prescriptions',
        field: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeConstraint('medications', 'medications_prescriptionId_fkey');
    await queryInterface.addConstraint('medications', {
      fields: ['prescriptionId'],
      type: 'foreign key',
      name: 'medications_prescriptionId_fkey',
      references: {
        table: 'prescriptions',
        field: 'id',
      },
      onDelete: 'NO ACTION',
      onUpdate: 'CASCADE',
    });
  }
}; 