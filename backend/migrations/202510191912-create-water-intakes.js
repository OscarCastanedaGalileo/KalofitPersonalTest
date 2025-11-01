'use strict';
/** @type {import ('sequelize-cli').Migration } */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('WaterIntakes', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      userId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Users',
          key: 'id',
        },
        allowNull: false,
      },
      mililiters: {
        type: Sequelize.DECIMAL,
      },
      consumedAt: {
        type: Sequelize.DATE,
      },
      note: {
        type: Sequelize.TEXT,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('WaterIntakes');
  },
};