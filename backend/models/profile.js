"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Profile extends Model {
    static associate(models) {
      Profile.belongsTo(models.User, {
        foreignKey: "userId",
        as: "user",
      });
    }
  }
  Profile.init(
    {
      userId: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      dailyKcalGoal: DataTypes.INTEGER,
      dailyWaterGoal: DataTypes.INTEGER, // Meta diaria de agua en ml
      birthDate: DataTypes.DATE,
      weight: DataTypes.DECIMAL,
      height: DataTypes.DECIMAL,
      gender: DataTypes.STRING,
      activityLevel: DataTypes.STRING,
      photo: DataTypes.STRING, // URL de la foto de perfil
    },
    {
      sequelize,
      modelName: "Profile",
    }
  );
  return Profile;
};
