"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class FoodUnit extends Model {
    static associate(models) {
      FoodUnit.belongsTo(models.Food, {
        foreignKey: "foodId",
        as: "food",
      });

      FoodUnit.belongsTo(models.Unit, {
        foreignKey: "unitId",
        as: "unit",
      });

      FoodUnit.belongsTo(models.User, {
        foreignKey: "createdBy",
        as: "creator",
      });
    }
  }
  FoodUnit.init({
    foodId: DataTypes.BIGINT,
    unitId: DataTypes.BIGINT,
    gramsPerUnit: DataTypes.DECIMAL,
    createdBy: DataTypes.BIGINT
  }, {
    sequelize,
    modelName: 'FoodUnit',
    tableName: 'FoodUnits',
  });
  return FoodUnit;
};
