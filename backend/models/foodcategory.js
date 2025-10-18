'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class FoodCategory extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      FoodCategory.belongsTo(models.User, {
        foreignKey: 'createdBy',
        as: 'creator'
      });
    }
  }
  FoodCategory.init({
    name: DataTypes.STRING,
    createdBy: DataTypes.BIGINT
  }, {
    sequelize,
    modelName: 'FoodCategory',
  });
  return FoodCategory;
};
