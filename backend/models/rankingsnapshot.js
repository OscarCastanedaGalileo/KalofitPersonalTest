'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class RankingSnapshot extends Model {
        static associate(models) {
            RankingSnapshot.belongsTo(models.RankingPeriod, {
                foreignKey: 'rankingPeriodId',
                as: 'rankingPeriod',
            });
            RankingSnapshot.belongsTo(models.User, {
                foreignKey: 'userId',
                as: 'user',
            });
        }
    }
    RankingSnapshot.init(
        {
            position: { type: DataTypes.INTEGER },
            value: { type: DataTypes.DECIMAL },
            details: { type: DataTypes.TEXT },
            createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
            updatedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
        },
        {
            sequelize,
            modelName: 'RankingSnapshot',
            tableName: 'RankingSnapshots',
        }
    );
    return RankingSnapshot;
}; 
