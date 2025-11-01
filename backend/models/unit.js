"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Unit extends Model {
    static associate(models) {
      // definir asociacion
    }
  }
  Unit.init(
    {
      name: DataTypes.STRING,
      type: DataTypes.STRING,
      isBase: DataTypes.BOOLEAN,
    },
    {
      sequelize,
      modelName: "Unit",
    }
  );
  return Unit;
};
