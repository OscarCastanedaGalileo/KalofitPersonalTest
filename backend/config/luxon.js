// Configuración global de Luxon
const { Settings } = require('luxon');

// Establecer zona horaria por defecto para toda la aplicación
Settings.defaultZone = 'America/Guatemala';

module.exports = { Settings };