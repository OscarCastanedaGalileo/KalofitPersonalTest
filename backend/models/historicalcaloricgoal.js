'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class HistoricCaloricGoals extends Model {
        static associate(models) {
            HistoricCaloricGoals.belongsTo(models.User, {
                foreignKey: 'userId',
                as: 'user',
            });
        }  
    }
    HistoricCaloricGoals.init(
        {
            dailyCaloricGoal: { type: DataTypes.INTEGER, allowNull: false },
            availableStartDate: { type: DataTypes.DATE,  allowNull: false },
            availableEndDate: { type: DataTypes.DATE, allowNull: false },
            createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
            updatedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
        },
        {
            sequelize,
            modelName: 'HistoricCaloricGoals',
            tableName: 'HistoricCaloricGoals',
        }
    );
    return HistoricCaloricGoals;
};