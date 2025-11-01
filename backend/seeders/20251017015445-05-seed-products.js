'use strict';
const { ProductCategory } = require('../models');
module.exports = {
  async up (queryInterface, Sequelize) {
    // Suponiendo que la tabla se llama 'Products'
    const supplementsCategory = await ProductCategory.findOne({ where: { name: 'Supplements' } });
    const sportswearCategory = await ProductCategory.findOne({ where: { name: 'Sportswear' } });
    await queryInterface.bulkInsert('Products', [
      {
        name: 'Whey Isolate Protein',
        description: 'High quality protein for muscle recovery.',
        price: 49.99,
        stock: 100,
        productCategoryId: supplementsCategory.id,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Creatine Monohydrate',
        description: 'Improves performance and strength.',
        price: 24.99,
        stock: 150,
        productCategoryId: supplementsCategory.id,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Breathable Technical T-shirt',
        description: 'Ideal for intense workouts.',
        price: 29.99,
        stock: 200,
        productCategoryId: sportswearCategory.id,
        createdAt: new Date(),
        updatedAt: new Date()
      }
  ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Products', null, {});
  }
};
