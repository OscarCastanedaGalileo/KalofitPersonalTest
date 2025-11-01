'use strict';
/** @type {import ('sequelize-cli').Migration } */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('RankingPeriods', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      type: {
        type: Sequelize.STRING,
      },
      startDate: {
        type: Sequelize.DATE,
      },
      endDate: {
        type: Sequelize.DATE,
      },
      metric: {
        type: Sequelize.STRING,
      },
      generatedAt: {
        type: Sequelize.DATE,
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('RankingPeriods');
  }
};