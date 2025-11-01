"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class WaterLog extends Model {
    static associate(models) {
      WaterLog.belongsTo(models.User, {
        foreignKey: "userId",
        as: "user",
      });
    }
  }
  WaterLog.init(
    {
      userId: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      amount: {
        type: DataTypes.DECIMAL,
        allowNull: false,
      },
      loggedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "WaterLog",
    }
  );
  return WaterLog;
};
