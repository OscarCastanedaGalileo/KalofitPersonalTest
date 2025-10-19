'use strict';
/** @type {import  ('sequelize-cli').Migration } */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('FoodLogs', {
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
      foodId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Food',
          key: 'id',
        },
        allowNull: false,
      },
      quantity: {
        type: Sequelize.DECIMAL,
        allowNull: false,
      },
      unitId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Units',
          key: 'id',
        },
        allowNull: false,
      },
      grams: {
        type: Sequelize.DECIMAL,
      },
      totalCalories: {
        type: Sequelize.DECIMAL,
      },
      consumedAt: {
        type: Sequelize.DATE,
      },
      deletedAt: {
        type: Sequelize.DATE,
      },
      notes: {
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
    await queryInterface.dropTable('FoodLogs');
  },
};
      