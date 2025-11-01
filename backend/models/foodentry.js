"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class FoodEntry extends Model {
    static associate(models) {
      FoodEntry.belongsTo(models.User, { foreignKey: "userId", as: "user" });
      FoodEntry.belongsTo(models.Food, { foreignKey: "foodId", as: "food" });
    }
  }

  FoodEntry.init(
    {
      userId: { type: DataTypes.BIGINT, allowNull: false },
      foodId: { type: DataTypes.BIGINT, allowNull: true },
      grams: { type: DataTypes.DECIMAL, allowNull: false },
      calories: { type: DataTypes.DECIMAL, allowNull: false },
      loggedAt: { type: DataTypes.DATE, allowNull: false },
    },
    {
      sequelize,
      modelName: "FoodEntry",
      tableName: "FoodEntries",
    }
  );

  return FoodEntry;
};
