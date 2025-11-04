"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  // Función UP: Agrega las nuevas columnas
  async up(queryInterface, Sequelize) {
    // Agregar columna userId
    await queryInterface.addColumn("Recipes", "userId", {
      type: Sequelize.INTEGER,
      allowNull: false, // 🚨 CRÍTICO: Debe coincidir con tu modelo
      // Opcional: Agregar clave foránea
      references: {
        model: "Users", // Nombre de la tabla de usuarios
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    });

    // Agregar columna servings
    await queryInterface.addColumn("Recipes", "servings", {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 1, // 🚨 CRÍTICO: Debe coincidir con tu modelo
    });

    // Agregar columna deletedAt (para 'paranoid: true')
    await queryInterface.addColumn("Recipes", "deletedAt", {
      type: Sequelize.DATE,
      allowNull: true, // Debe ser true para permitir NULL
    });
  },

  // Función DOWN: Revierte los cambios (elimina las columnas)
  async down(queryInterface, Sequelize) {
    // Eliminar columna deletedAt
    await queryInterface.removeColumn("Recipes", "deletedAt");

    // Eliminar columna servings
    await queryInterface.removeColumn("Recipes", "servings");

    // Eliminar columna userId
    await queryInterface.removeColumn("Recipes", "userId");
  },
};
