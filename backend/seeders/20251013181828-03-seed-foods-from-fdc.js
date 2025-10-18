'use strict';
// Importamos tu servicio existente para no repetir código
const fdcService = require('../services/fdc.service');

module.exports = {
  async up (queryInterface, Sequelize) {
    try {
      console.log('Iniciando precarga de alimentos desde FDC...');

      // IDs fijos que creamos en los seeders 01 y 02
      const DEFAULT_USER_ID = 1;
      const DEFAULT_CATEGORY_ID = 1;

      // Generamos una página aleatoria para obtener variedad de alimentos
      const randomPage = Math.floor(Math.random() * 200) + 1;
      
      console.log(`Obteniendo 100 alimentos de la página aleatoria: ${randomPage}...`);
      
      const foodsFromAPI = await fdcService.listFoods(randomPage, 100);

      // Mapeamos la respuesta de la API al formato de nuestra tabla 'Food'
      const foodsToInsert = foodsFromAPI.map(food => {
        // Buscamos el nutriente de energía (calorías, ID 1008)
        const calorieNutrient = food.foodNutrients.find(n => n.nutrientId === 1008);
        
        // La API da el valor por 100g, lo dividimos para tenerlo por gramo.
        // Si no se encuentra, asignamos 0.
        const caloriesPerGram = calorieNutrient ? (calorieNutrient.value / 100) : 0;

        return {
          name: food.description,
          caloriesPerGram: caloriesPerGram,
          foodCategoryId: DEFAULT_CATEGORY_ID, // Asignamos la categoría por defecto
          createdBy: DEFAULT_USER_ID,         // Asignamos el usuario creador por defecto
          isCustom: false,                    // Marcamos que no es un alimento personalizado
          createdAt: new Date(),
          updatedAt: new Date(),
        };
      });

      // Insertamos los datos en la tabla 'Food' (el nombre definido en tu migración)
      await queryInterface.bulkInsert('Food', foodsToInsert, {});
      
      console.log(`✅ ¡Éxito! ${foodsToInsert.length} alimentos han sido insertados.`);

    } catch (error) {
      console.error('❌ Error al insertar los alimentos desde FDC:', error.message);
    }
  },

  async down (queryInterface, Sequelize) {
    // Al revertir, borramos solo los alimentos insertados por este seeder
    await queryInterface.bulkDelete('Food', { isCustom: false }, {});
  }
};