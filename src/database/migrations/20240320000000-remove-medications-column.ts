import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    await queryInterface.removeColumn("prescriptions", "medications");
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.addColumn("prescriptions", "medications", {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: []
    });
  }
}; 