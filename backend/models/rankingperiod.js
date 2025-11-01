'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class RankingPeriod extends Model {
        static associate(models) {
        }
    }
    RankingPeriod.init({
        type: DataTypes.STRING,
        startDate: DataTypes.DATE,
        endDate: DataTypes.DATE,
        metric: DataTypes.STRING,
        generatedAt: DataTypes.DATE
    }, {
        sequelize,
        modelName: 'RankingPeriod',
        tableName: 'RankingPeriods',
    });
    return RankingPeriod;
};