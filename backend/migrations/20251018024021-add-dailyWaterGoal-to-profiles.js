"use strict";

module.exports = {

  up: async (queryInterface, Sequelize) => {
    // Añadimos la columna 'dailyWaterGoal' a la tabla 'Profiles'
    await queryInterface.addColumn("Profiles", "dailyWaterGoal", {
      type: Sequelize.INTEGER,
      defaultValue: 3000,
      allowNull: false,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("Profiles", "dailyWaterGoal");
  },
};
