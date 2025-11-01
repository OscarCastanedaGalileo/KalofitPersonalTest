'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Notification extends Model {
        static associate(models) {
            Notification.belongsTo(models.User, {
                foreignKey: 'userId',
                as: 'user',
            });
        }
    }
    Notification.init(
        {
            type: { type: DataTypes.STRING, allowNull: false },
            tytle: { type: DataTypes.STRING, allowNull: false },
            body: { type: DataTypes.TEXT, allowNull: false },
            createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
            readAt: { type: DataTypes.DATE },
            excpiredAt: { type: DataTypes.DATE },
        },
        {
            sequelize,
            modelName: 'Notification',
            tableName: 'Notifications',
        }
    );
    return Notification;
};