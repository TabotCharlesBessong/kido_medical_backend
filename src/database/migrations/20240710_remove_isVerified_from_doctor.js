module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('doctors', 'isVerified');
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('doctors', 'isVerified', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    });
  }
}; 