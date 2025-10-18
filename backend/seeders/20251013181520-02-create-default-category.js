'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('FoodCategories', [{
      id: 1,
      name: 'General',
      createdBy: 1, // <- LÍNEA AÑADIDA: Asigna el usuario "System" (con id=1) como creador
      createdAt: new Date(),
      updatedAt: new Date()
    }], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('FoodCategories', { id: 1 });
  }
};