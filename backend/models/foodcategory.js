"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class FoodCategory extends Model {
    static associate(models) {
      FoodCategory.belongsTo(models.User, {
        foreignKey: "createdBy",
        as: "creator",
      });
    }
  }
  FoodCategory.init(
    {
      name: DataTypes.STRING,
      createdBy: DataTypes.BIGINT,
    },
    {
      sequelize,
      modelName: "FoodCategory",
    }
  );
  return FoodCategory;
};
