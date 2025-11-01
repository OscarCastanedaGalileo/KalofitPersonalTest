'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class HistoricWeight extends Model {
        static associate(models) {
            HistoricWeight.belongsTo(models.User, {
                foreignKey: 'userId',
                as: 'user',
            });
        }
    }
    HistoricWeight.init(
        {
            date: { type: DataTypes.DATE, allowNull: false },
            weight: { type: DataTypes.DECIMAL, allowNull: false },
            origin: { type: DataTypes.STRING },
            note: { type: DataTypes.TEXT },
            createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
            updatedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
        },
        {
            sequelize,
            modelName: 'HistoricWeight',
            tableName: 'HistoricWeights',
        }
    );
    return HistoricWeight;
}