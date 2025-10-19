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
            FoodLog.belongsTo(models.Unit, {
                foreignKey: 'unitId',
                as: 'unit',
            });
        }
    }
    FoodLog.init(
        {
            quantity: { type: DataTypes.DECIMAL},
            grams: { type: DataTypes.DECIMAL},
            totalCalories: { type: DataTypes.DECIMAL},
            consumedAt: { type: DataTypes.DATE },
            deletedAt: { type: DataTypes.DATE },
            notes: { type: DataTypes.TEXT },
            createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
            updatedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
        },
        {
            sequelize,
            modelName: 'FoodLog',
            tableName: 'FoodLog',
        }
    );
    return FoodLog;
};