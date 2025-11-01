
module.exports = (sequelize, DataTypes) => {
  const Medida = sequelize.define('Medida', {
    nombre_medida: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    gramos_equivalentes: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
    },
  });

  Medida.associate = (models) => {
    // Una Medida pertenece a un solo Alimento
    Medida.belongsTo(models.Alimento, {
      foreignKey: 'alimentoId',
      as: 'alimento',
    });
  };

  return Medida;
};