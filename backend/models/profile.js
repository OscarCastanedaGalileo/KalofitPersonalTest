'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Profile extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Profile.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user'
      });
    }
  }
  Profile.init({
    userId: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    dailyKcalGoal: DataTypes.INTEGER,
    birthDate: DataTypes.DATE,
    weight: DataTypes.DECIMAL,
    height: DataTypes.DECIMAL,
    gender: DataTypes.STRING,
    activityLevel: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Profile',
  });
  return Profile;
};
