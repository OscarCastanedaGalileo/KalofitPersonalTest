'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    // Suponiendo que la tabla se llama 'ProductCategories'
    await queryInterface.bulkInsert('ProductCategories', [
      {
        name: 'Supplements',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Sportswear',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Accessories',
        createdAt: new Date(),
        updatedAt: new Date()
      }
  ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('ProductCategories', null, {});
  }
};
