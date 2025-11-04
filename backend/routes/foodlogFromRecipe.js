const express = require('express');
const router = express.Router();
const foodLogController = require('../controllers/foodLogController');
const { Recipe, RecipeIngredient, Food, FoodLog } = require('../models');

router.post('/:recipeId', async (req, res) => {
  try {
    const userId = req.user.id;
    const { recipeId } = req.params;
    const { consumedAt, quantity = 1 } = req.body;

    // Obtener la receta con sus ingredientes
    const recipe = await Recipe.findOne({
      where: { id: recipeId, userId },
      include: [{
        model: RecipeIngredient,
        as: 'ingredients',
        include: [{
          model: Food,
          as: 'food'
        }]
      }]
    });

    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }

    // Crear un FoodLog para cada ingrediente
    const foodLogs = [];
    for (const ingredient of recipe.ingredients) {
      // Ajustar los gramos según la cantidad de porciones
      const adjustedGrams = Number(ingredient.grams) * Number(quantity);
      
      // Calcular calorías
      console.log('Ingredient:', {
        foodId: ingredient.foodId,
        caloriesPerGram: ingredient.food.caloriesPerGram,
        grams: adjustedGrams
      });
      
      const calories = ingredient.food.caloriesPerGram * adjustedGrams;

      // Crear el registro directamente usando el modelo FoodLog
      const foodLogData = {
        userId,
        foodId: ingredient.foodId,
        recipeId: recipe.id,
        grams: adjustedGrams,
        quantity: ingredient.quantity ? Number(ingredient.quantity) * Number(quantity) : null,
        unitId: ingredient.unitId,
        totalCalories: calories,
        consumedAt: consumedAt || new Date(),
        notes: req.body.notes || null
      };
      
      console.log('Creating FoodLog with data:', foodLogData);
      const newFoodLog = await FoodLog.create({
        userId,
        foodId: ingredient.foodId,
        recipeId: recipe.id,  // Agregamos la referencia a la receta
        grams: adjustedGrams,
        quantity: ingredient.quantity ? Number(ingredient.quantity) * Number(quantity) : null,
        unitId: ingredient.unitId,
        totalCalories: calories,
        consumedAt: consumedAt || new Date(),
        notes: req.body.notes || null  // Usamos las notas del usuario si las proporciona
      });

      if (newFoodLog) {
        foodLogs.push(newFoodLog);
      }
    }

    res.status(201).json({
      message: 'Food logs created from recipe',
      recipeName: recipe.name,
      foodLogs
    });

  } catch (error) {
    console.error('Error creating food logs from recipe:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
      ...(error.original && { original: error.original })
    });
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;