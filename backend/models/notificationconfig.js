'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class NotificationConfig extends Model {
        static associate(models) {
            NotificationConfig.belongsTo(models.User, {
                foreignKey: 'userId',
                as: 'user',
            });
        }
    }
    NotificationConfig.init(
        {
            time: { type: DataTypes.TIME, allowNull: false },
            type: { type: DataTypes.STRING, allowNull: false },
            daysOfWeek: { type: DataTypes.STRING, allowNull: false },
            active: { type: DataTypes.BOOLEAN, defaultValue: true },
        },
        {
            sequelize,
            modelName: 'NotificationConfig',
            tableName: 'NotificationConfigs',
        }
    );
    return NotificationConfig;
};