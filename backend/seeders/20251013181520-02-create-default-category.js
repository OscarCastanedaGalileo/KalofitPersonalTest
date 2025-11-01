'use strict';
const { User } = require('../models');

module.exports = {
  async up(queryInterface, Sequelize) {
    // Usamos el ID=1 para el usuario "System" que creamos en el primer seeder
    const defaultUser = await User.findOne({ where: { email: 'system@kalo.fit' } });

    await queryInterface.bulkInsert('FoodCategories', [
      { name: 'General', createdBy: defaultUser.id, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Fruits', createdBy: defaultUser.id, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Vegetables', createdBy: defaultUser.id, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Grains and Legumes', createdBy: defaultUser.id, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Meat and Poultry', createdBy: defaultUser.id, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Fish and Seafood', createdBy: defaultUser.id, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Dairy and Eggs', createdBy: defaultUser.id, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Beverages', createdBy: defaultUser.id, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Snacks and Sweets', createdBy: defaultUser.id, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Custom', createdBy: defaultUser.id, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Restaurant / Processed', createdBy: defaultUser.id, createdAt: new Date(), updatedAt: new Date() }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('FoodCategories', null, {});
  }
};
