'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class FoodLogTag extends Model {
        static associate(models) {
            FoodLogTag.belongsTo(models.FoodLog, {
                foreignKey: 'foodLogId',
                as: 'foodLog',
            });
            FoodLogTag.belongsTo(models.Tag, {
                foreignKey: 'tagId',
                as: 'tag',
            });
        }
    }
    FoodLogTag.init(
        {
            createdBy: { type: DataTypes.BIGINT },
            createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
            updatedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
        },
        {
            sequelize,
            modelName: 'FoodLogTag',
            tableName: 'FoodLogTags',
        }
    );
    return FoodLogTag;
};