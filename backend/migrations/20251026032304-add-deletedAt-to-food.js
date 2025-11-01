"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // adds column 'deletedAt' to the "Food" table
    await queryInterface.addColumn("Food", "deletedAt", {
      allowNull: true,
      type: Sequelize.DATE,
    });
  },

  down: async (queryInterface, Sequelize) => {
    // To revert, the column is removed
    await queryInterface.removeColumn("Food", "deletedAt");
  },
};
