"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class FoodCategory extends Model {
    static associate(models) {
      FoodCategory.belongsTo(models.User, {
        foreignKey: "createdBy",
        as: "creator",
      });
      FoodCategory.hasMany(models.Food, {
        foreignKey: "foodCategoryId",
        as: "foods",
        onDelete: "CASCADE",
        hooks: true,
      });
    }
  }
  FoodCategory.init(
    {
      name: DataTypes.STRING,
      // NOTE: `isPublic` is deprecated and will be removed; keep column for compatibility
      isPublic: { type: DataTypes.BOOLEAN, defaultValue: false },
      createdBy: DataTypes.BIGINT,
      deletedAt: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: "FoodCategory",
      paranoid: true, // enable soft deletes (set deletedAt instead of hard delete)
    }
  );
  return FoodCategory;
};

