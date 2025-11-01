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
      name: DataTypes.STRING,
      caloriesPerGram: DataTypes.DECIMAL,
      foodCategoryId: DataTypes.BIGINT,
      createdBy: DataTypes.BIGINT,
      isCustom: DataTypes.BOOLEAN,
    },
    {
      sequelize,
      modelName: "Food",
      paranoid: true, // enables soft delete (changes DELETE for UPDATE)
      deletedAt: 'deletedAt', // states the name of the column to be used
    }
  );
  return Food;
};
