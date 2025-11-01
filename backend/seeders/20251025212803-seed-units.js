'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
    */
    // Unidades comunes para alimentos
    const now = new Date();
    const units = [
      { name: 'Gram', type: 'mass', isBase: true, createdAt: now, updatedAt: now },
      { name: 'Kilogram', type: 'mass', isBase: false, createdAt: now, updatedAt: now },
      { name: 'Piece', createdAt: now, updatedAt: now },
      { name: 'Cup', createdAt: now, updatedAt: now },
      { name: 'Tablespoon', createdAt: now, updatedAt: now },
      { name: 'Teaspoon', createdAt: now, updatedAt: now },
    ];
    await queryInterface.bulkInsert('Units', units, {});
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    await queryInterface.bulkDelete('Units', null, {});
  }
};
