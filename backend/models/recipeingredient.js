'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class RecipeIngredient extends Model {
        static associate(models) {
            RecipeIngredient.belongsTo(models.Recipe, {
                foreignKey: 'recipeId',
                as: 'recipe',
            });
            RecipeIngredient.belongsTo(models.Food, {
                foreignKey: 'foodId',
                as: 'food',
            });
            RecipeIngredient.belongsTo(models.Unit, {
                foreignKey: 'unitId',
                as: 'unit',
            });
        }
    }
    RecipeIngredient.init(
        {
            quantity: { type: DataTypes.DECIMAL},
            grams: { type: DataTypes.DECIMAL},
            createdBy: { type: DataTypes.BIGINT },
            createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
            updatedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
        },
        {
            sequelize,
            modelName: 'RecipeIngredient',
            tableName: 'RecipeIngredients',
        }
    );
    return RecipeIngredient;
};