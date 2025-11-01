'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class FoodLog extends Model {
    static associate(models) {
      FoodLog.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user',
      });
      FoodLog.belongsTo(models.Food, {
        foreignKey: 'foodId',
        as: 'food',
      });
      FoodLog.belongsTo(models.Recipe, {
        foreignKey: 'recipeId',
        as: 'recipe',
      });
      FoodLog.belongsTo(models.Unit, {
        foreignKey: 'unitId',
        as: 'unit',
      });
      FoodLog.belongsToMany(models.Tag, {
        through: models.FoodLogTag,
        foreignKey: 'foodLogId',
        otherKey: 'tagId',
        as: 'tags',
      });
    }
  }
  FoodLog.init(
    {
      userId: { type: DataTypes.BIGINT, allowNull: false },
      foodId: { type: DataTypes.BIGINT, allowNull: false },
      recipeId: { type: DataTypes.BIGINT, allowNull: true },
      unitId: { type: DataTypes.BIGINT, allowNull: false },
      quantity: { type: DataTypes.DECIMAL },
      grams: { type: DataTypes.DECIMAL },
      totalCalories: { type: DataTypes.DECIMAL },
      consumedAt: { type: DataTypes.DATE },
      deletedAt: { type: DataTypes.DATE },
      notes: { type: DataTypes.TEXT },
      createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
      updatedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    },
    {
      sequelize,
      modelName: 'FoodLog',
      tableName: 'FoodLogs',
      paranoid: true,
    }
  );
  return FoodLog;
};
