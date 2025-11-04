
require('dotenv').config();

module.exports = {
  development: {
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    host: process.env.DB_HOST,
    dialect: process.env.DB_DIALECT,
    timezone: 'America/Guatemala', // Configurar zona horaria de Guatemala
    dialectOptions: {
      timezone: 'America/Guatemala', // Para PostgreSQL específicamente
    },
  },
  test: {
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    host: process.env.DB_HOST,
    dialect: process.env.DB_DIALECT,
    timezone: 'America/Guatemala', // Configurar zona horaria de Guatemala
    dialectOptions: {
      timezone: 'America/Guatemala', // Para PostgreSQL específicamente
    },
  },
  production: {
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    host: process.env.DB_HOST,
    dialect: process.env.DB_DIALECT,
    timezone: 'America/Guatemala', // Configurar zona horaria de Guatemala
    dialectOptions: {
      timezone: 'America/Guatemala', // Para PostgreSQL específicamente
    },
  }
};
