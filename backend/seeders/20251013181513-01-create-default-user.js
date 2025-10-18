'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Users', [{
      id: 1,
      name: 'System Data',     // <- CAMBIO: Se combinó firstName y lastName en 'name'
      email: 'system@kalo.fit',
      hashPassword: 'no-password-required', // <- CAMBIO: El nombre de la columna es 'hashPassword'
      isConfirmed: true,        // <- AÑADIDO: Para completar el esquema de la tabla
      createdAt: new Date(),
      updatedAt: new Date()
    }], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Users', { id: 1 });
  }
};