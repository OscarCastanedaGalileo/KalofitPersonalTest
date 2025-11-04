'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Reminder extends Model {
    static associate(models) {
      // Un recordatorio pertenece a un usuario
      Reminder.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user'
      });
    }
  }
  Reminder.init({
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    time: {
      type: DataTypes.TIME, // Coincide con la migración
      allowNull: false
    },
    isEnabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false
    }
    // userId se define a través de la asociación
  }, {
    sequelize,
    modelName: 'Reminder',
  });
  return Reminder;
};