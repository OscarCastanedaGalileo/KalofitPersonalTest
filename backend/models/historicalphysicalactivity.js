'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class HistoricalPhysicalActivity extends Model {
        static associate(models) {
            HistoricalPhysicalActivity.belongsTo(models.User, {
                foreignKey: 'userId',
                as: 'user',
            });
        }
    }
    HistoricalPhysicalActivity.init(
        {
            level: { type: DataTypes.STRING, allowNull: false },
            factor: { type: DataTypes.DECIMAL, allowNull: false },
            availableStartDate: { type: DataTypes.DATE, allowNull: false },
            availableEndDate: { type: DataTypes.DATE, allowNull: false },
            createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
            updatedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
        },
        {
            sequelize,
            modelName: 'HistoricalPhysicalActivity',
            tableName: 'HistoricalPhysicalActivities',
        }
    );
    return HistoricalPhysicalActivity;
};