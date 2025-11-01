"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("FoodEntries", {
      id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.BIGINT },
      userId: { type: Sequelize.BIGINT, allowNull: false, references: { model: "Users", key: "id" }, onDelete: "CASCADE" },
      foodId: { type: Sequelize.BIGINT, allowNull: true, references: { model: "Food", key: "id" }, onDelete: "SET NULL" },
      grams: { type: Sequelize.DECIMAL, allowNull: false },
      calories: { type: Sequelize.DECIMAL, allowNull: false },
      loggedAt: { type: Sequelize.DATE, allowNull: false },
      createdAt: { allowNull: false, type: Sequelize.DATE },
      updatedAt: { allowNull: false, type: Sequelize.DATE },
    });

    await queryInterface.addIndex("FoodEntries", ["userId", "loggedAt"]);
  },
  async down(queryInterface) {
    await queryInterface.dropTable("FoodEntries");
  },
};
