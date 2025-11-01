'use strict';
const fdcService = require('../services/fdc.service');

const { getCategoryIdByDescription, loadCategories } = require('../utils/category.mapper');

const { User } = require('../models');
module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      const defaultUser = await User.findOne({ where: { email: 'system@kalo.fit' } });
      const randomPage = Math.floor(Math.random() * 200) + 1;
      const foodList = await fdcService.listFoods(randomPage, 100);

      // Divide en chunks de 10 para evitar saturar la API
      const chunkSize = 10;
      const foodChunks = [];
      for (let i = 0; i < foodList.length; i += chunkSize) {
        foodChunks.push(foodList.slice(i, i + chunkSize));
      }

      const detailedFoods = [];
      for (const chunk of foodChunks) {
        const details = await Promise.all(chunk.map(fdc => fdcService.foodById(fdc.fdcId)));
        detailedFoods.push(...details);
      }
      await loadCategories();

      const foodsToInsert = detailedFoods
        .map(food => {
          const calorieNutrient = food.foodNutrients.find(n => n.nutrient && n.nutrient.id === 1008);
          const caloriesPerGram = calorieNutrient ? (calorieNutrient.amount / 100) : 0;
          const foodCategoryId = getCategoryIdByDescription(food.description);
          return {
            name: food.description,
            caloriesPerGram: caloriesPerGram.toFixed(2),
            foodCategoryId,
            createdBy: defaultUser.id,
            isCustom: false,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
        })
        .filter(food => food.caloriesPerGram > 0);

      if (foodsToInsert.length > 0) {
        await queryInterface.bulkInsert('Food', foodsToInsert, {});
        console.log(`Inserted ${foodsToInsert.length} foods with details and categories.`);
      } else {
        console.log('No foods with calorie data found on this page. Try again.');
      }
    } catch (error) {
      console.error('Error inserting foods from FDC:', error);
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Food', { isCustom: false }, {});
  }
};
