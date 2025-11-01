'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class PasswordReset extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      PasswordReset.belongsTo(models.User, { foreignKey: 'userId' });
    }
  }
  PasswordReset.init({
    userId: DataTypes.INTEGER,
    codeHash: DataTypes.STRING,
    expiresAt: DataTypes.DATE,
    attempts: DataTypes.INTEGER,
    consumed: DataTypes.BOOLEAN,
    ip: DataTypes.STRING,
    userAgent: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'PasswordReset',
  });
  return PasswordReset;
};
