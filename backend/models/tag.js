'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Tag extends Model {
        static associate(models) {
            Tag.belongsTo(models.User, {
                foreignKey: 'userId',
                as: 'user',
            });
            Tag.belongsToMany(models.FoodLog, {
                through: models.FoodLogTag,
                foreignKey: 'tagId',
                otherKey: 'foodLogId',
                as: 'foodLogs',
            });
        }
    }
    Tag.init(
        {
            name: { type: DataTypes.STRING },
            userId: { type: DataTypes.BIGINT },
            createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
            updatedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
        },
        {
            sequelize,
            modelName: 'Tag',
            tableName: 'Tags',
        }
    );
    return Tag;
};
