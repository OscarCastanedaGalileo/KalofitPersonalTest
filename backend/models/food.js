"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Food extends Model {
    static associate(models) {
      Food.belongsTo(models.FoodCategory, {
        foreignKey: "foodCategoryId",
        as: "category",
      });
      Food.belongsTo(models.User, {
        foreignKey: "createdBy",
        as: "creator",
      });
    }
  }
  Food.init(
    {
      name: { type: DataTypes.STRING },
      caloriesPerGram: { type: DataTypes.DECIMAL },
      foodCategoryId: { type: DataTypes.BIGINT, allowNull: false },
      createdBy: { type: DataTypes.BIGINT, allowNull: false },
      isCustom: { type: DataTypes.BOOLEAN, defaultValue: true },
    },
    {
      sequelize,
      modelName: "Food",
      tableName: "Food",
    }
  );
  return Food;
};
