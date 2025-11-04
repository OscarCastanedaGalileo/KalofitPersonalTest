"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      User.hasOne(models.Profile, { foreignKey: 'userId', as: 'profile' });
    }
  }
  User.init(
    {
      name: DataTypes.STRING,
      email: DataTypes.STRING,
      hashPassword: DataTypes.STRING,
      isConfirmed: DataTypes.BOOLEAN,
      // new role field: 'basic' or 'admin'
      role: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'basic',
        validate: {
          isIn: [['basic', 'admin']]
        }
      },
    },
    {
      sequelize,
      modelName: "User",
      paranoid: true, // Enable soft delete
    }
  );
  return User;
};
