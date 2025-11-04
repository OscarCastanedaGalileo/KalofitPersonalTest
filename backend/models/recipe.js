
"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Recipe extends Model {
    static associate(models) {
      // 1. Relación con el usuario que la creó
      Recipe.belongsTo(models.User, {
        foreignKey: "userId",
        as: "user",
      });

      Recipe.hasMany(models.RecipeIngredient, {
        foreignKey: "recipeId",
        as: "ingredients",
      });
    }
  }
  Recipe.init(
    {
      name: { type: DataTypes.STRING, allowNull: false },
      totalGrams: { type: DataTypes.DECIMAL, allowNull: false },
      totalCalories: { type: DataTypes.DECIMAL, allowNull: false },
      userId: { type: DataTypes.INTEGER, allowNull: false },
      servings: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
      createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
      updatedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
      deletedAt: { type: DataTypes.DATE, allowNull: true },
    },
    {
      sequelize,
      modelName: "Recipe",
      tableName: "Recipes",
      paranoid: true,
    }
  );
  return Recipe;
};
