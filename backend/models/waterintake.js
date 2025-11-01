'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class WaterIntake extends Model {
        static associate(models) {
            WaterIntake.belongsTo(models.User, {
                foreignKey: 'userId',
                as: 'user',
            });
        }
    }
    WaterIntake.init(
        {
            mililiters: { type: DataTypes.DECIMAL},
            consumedAt: { type: DataTypes.DATE },
            note: { type: DataTypes.TEXT },
            createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
            updatedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
        },
        {
            sequelize,
            modelName: 'WaterIntake',
            tableName: 'WaterIntakes',
        }
    );
    return WaterIntake;
};