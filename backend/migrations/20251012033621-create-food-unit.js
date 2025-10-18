'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('FoodUnits', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      foodId: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'Food',
          key: 'id'
        }
      },
      unitId: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'Units',
          key: 'id'
        }
      },
      gramsPerUnit: {
        type: Sequelize.DECIMAL
      },
      createdBy: {
        type: Sequelize.BIGINT
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('FoodUnits');
  }
};
