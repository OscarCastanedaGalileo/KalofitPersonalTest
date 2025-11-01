module.exports = (sequelize, DataTypes) => {
  const Alimento = sequelize.define('Alimento', {
    nombre: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    calorias_por_gramo: {
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

  Alimento.associate = (models) => {
    
    Alimento.hasMany(models.Medida, {
      foreignKey: 'alimentoId',
      as: 'medidas',
    });
  };

  return Alimento;
};