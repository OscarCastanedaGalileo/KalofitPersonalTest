/* const Sequelize = require('sequelize');

require('dotenv').config();

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
});

module.exports = sequelize; */

// backend/config/database.js

const { Sequelize } = require('sequelize');
require('dotenv').config(); // Asegura que las variables de .env se carguen

// Construye la conexión usando las variables de entorno individuales
const sequelize = new Sequelize(
  process.env.DB_DATABASE, // El nombre de la base de datos (ej: 'pg')
  process.env.DB_USERNAME, // El usuario (ej: 'pg')
  process.env.DB_PASSWORD, // La contraseña (ej: 'pg_secret')
  {
    host: process.env.DB_HOST,      // El host (ej: 'database')
    dialect: process.env.DB_DIALECT,  // El dialecto (ej: 'postgres')
    logging: false // Opcional: deshabilita los logs de SQL en la consola para no saturar
  }
);

module.exports = sequelize;
