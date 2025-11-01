'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Recipe extends Model {
        static associate(models) {
            Recipe.belongsTo(models.User, {
                foreignKey: 'userId',
                as: 'user',
            });
        }
    }
    Recipe.init(
        {
            name: { type: DataTypes.STRING, allowNull: false },
            totalGrams: { type: DataTypes.DECIMAL, allowNull: false },
            totalCalories: { type: DataTypes.DECIMAL, allowNull: false },
            createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
            updatedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
        },
        {
            sequelize,
            modelName: 'Recipe',
            tableName: 'Recipes',
        }
    );
    return Recipe;
};