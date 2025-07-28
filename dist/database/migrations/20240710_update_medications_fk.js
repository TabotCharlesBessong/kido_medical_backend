module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.removeConstraint('medications', 'medications_prescriptionId_fkey');
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
