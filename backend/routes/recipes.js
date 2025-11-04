const express = require("express");
const router = express.Router();
const { Recipe, RecipeIngredient, Food, FoodUnit, sequelize, Sequelize } = require("../models");
const { Op } = Sequelize;

// --- GET /api/recipes: list recipes for the authenticated user ---
router.get("/", async (req, res) => {
  const userId = req.user.id;

  try {
    const recipes = await Recipe.findAll({
      where: {
        userId: userId,
      },
      include: [
        {
          model: RecipeIngredient,
          as: "ingredients",
          attributes: ["quantity", "grams", "foodId", "unitId"],
          required: false,
          include: [
            {
              model: Food,
              as: "food",
              attributes: ["id", "name", "caloriesPerGram"],
              required: false,
              on: {
                id: sequelize.where(sequelize.col('ingredients.foodId'), '=', sequelize.col('ingredients->food.id'))
              }
            },
            {
              model: sequelize.models.Unit,
              as: "unit",
              attributes: ["id", "name"],
              required: false,
              on: {
                id: sequelize.where(sequelize.col('ingredients.unitId'), '=', sequelize.col('ingredients->unit.id'))
              }
            },
          ],
        },
      ],

      attributes: ["id", "name", "servings", "totalCalories", "createdAt"],
    });

    res.json(recipes);
  } catch (error) {
    console.error("Error fetching recipes:", error);
    res.status(500).json({ error: "Error fetching recipes." });
  }
});

// --- POST /api/recipes
router.post("/", async (req, res) => {
  const { name, instructions, servings, ingredients } = req.body;
  const userId = req.user.id;
  console.log("Creando receta con datos:", {
    name,
    servings,
    ingredients: ingredients.map(ing => ({
      foodId: ing.foodId,
      unitId: ing.unitId,
      quantity: ing.quantity
    }))
  });

  if (!name || !ingredients || ingredients.length === 0) {
    return res.status(400).json({ error: "Recipe name and ingredients are required." });
  }

  const t = await sequelize.transaction();

  try {
    let totalCalories = 0;
    let totalGrams = 0;

    const foodIds = ingredients.map((ing) => ing.foodId);
    const foods = await Food.findAll(
      {
        where: { id: foodIds },
        attributes: ["id", "caloriesPerGram"],
      },
      { transaction: t }
    );

    const foodMap = foods.reduce((map, food) => {
      map[food.id] = parseFloat(food.caloriesPerGram);
      return map;
    }, {});

    // Get gramsPerUnit for each ingredient's food-unit combination
    const foodUnits = await FoodUnit.findAll({
      where: {
        [Op.or]: ingredients.map(ing => ({
          foodId: ing.foodId,
          unitId: ing.unitId
        }))
      },
      attributes: ['foodId', 'unitId', 'gramsPerUnit']
    }, { transaction: t });

    const foodUnitMap = foodUnits.reduce((map, fu) => {
      map[`${fu.foodId}-${fu.unitId}`] = parseFloat(fu.gramsPerUnit);
      return map;
    }, {});

    const ingredientRecordsToCreate = [];

    for (const ing of ingredients) {
      const caloriesPerGram = foodMap[ing.foodId];
      const gramsPerUnit = foodUnitMap[`${ing.foodId}-${ing.unitId}`];
      
      if (!gramsPerUnit) {
        throw new Error(`No conversion found for food ${ing.foodId} with unit ${ing.unitId}`);
      }

      const quantity = parseFloat(ing.quantity);
      const ingredientGrams = quantity * gramsPerUnit;

      if (caloriesPerGram !== undefined && ingredientGrams) {
        totalGrams += ingredientGrams;
        totalCalories += caloriesPerGram * ingredientGrams;

        ingredientRecordsToCreate.push({
          recipeId: null,
          foodId: ing.foodId,
          quantity: parseFloat(ing.quantity),
          unitId: ing.unitId,
          grams: ingredientGrams.toFixed(2),
          createdBy: userId,
        });
      }
    }

    const newRecipe = await Recipe.create(
      {
        name,
        instructions: instructions || null,
        servings: parseInt(servings) || 1,
        totalGrams: totalGrams.toFixed(2),
        totalCalories: totalCalories.toFixed(2),
        userId,
      },
      { transaction: t }
    );

    const finalIngredientRecords = ingredientRecordsToCreate.map((record) => ({
      ...record,
      recipeId: newRecipe.id,
    }));

    await RecipeIngredient.bulkCreate(finalIngredientRecords, { transaction: t });

    await t.commit();

    res.status(201).json({
      recipe: newRecipe,
      caloriesPerServing: totalCalories / (parseInt(servings) || 1),
      message: "Recipe created successfully!",
    });
  } catch (error) {
    await t.rollback();
    console.error("Error creating recipe:", error);
    res.status(500).json({ error: error.message || "Error creating recipe." });
  }
});

// --- GET /api/recipes/:id: get a single recipe ---
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const recipe = await Recipe.findOne({
      where: {
        id: id,
        userId: userId,
      },
      include: [
        {
          model: RecipeIngredient,
          as: "ingredients",
          attributes: ["quantity", "grams", "foodId", "unitId"],
          include: [
            {
              model: Food,
              as: "food",
              attributes: ["id", "name", "caloriesPerGram"],
            },
            {
              model: sequelize.models.Unit,
              as: "unit",
              attributes: ["id", "name"],
            },
          ],
        },
      ],
    });

    if (!recipe) {
      return res.status(404).json({ error: "Recipe not found" });
    }

    res.json(recipe);
  } catch (error) {
    console.error("Error fetching recipe:", error);
    res.status(500).json({ error: "Error fetching recipe" });
  }
});

// --- PUT /api/recipes/:id: update a recipe ---
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const { name, instructions, servings, ingredients } = req.body;

  if (!name || !ingredients || ingredients.length === 0) {
    return res.status(400).json({ error: "Recipe name and ingredients are required." });
  }

  const t = await sequelize.transaction();

  try {
    // Verify recipe exists and belongs to user
    const recipe = await Recipe.findOne({
      where: { id, userId },
      transaction: t
    });

    if (!recipe) {
      await t.rollback();
      return res.status(404).json({ error: "Recipe not found or you don't have permission to edit it" });
    }

    let totalCalories = 0;
    let totalGrams = 0;

    // Get all foods for calorie calculation
    const foodIds = ingredients.map((ing) => ing.foodId);
    const foods = await Food.findAll(
      {
        where: { id: foodIds },
        attributes: ["id", "caloriesPerGram"],
      },
      { transaction: t }
    );

    const foodMap = foods.reduce((map, food) => {
      map[food.id] = parseFloat(food.caloriesPerGram);
      return map;
    }, {});

    // Get gramsPerUnit for each ingredient's food-unit combination
    const foodUnits = await FoodUnit.findAll({
      where: {
        [Op.or]: ingredients.map(ing => ({
          foodId: ing.foodId,
          unitId: ing.unitId
        }))
      },
      attributes: ['foodId', 'unitId', 'gramsPerUnit']
    }, { transaction: t });

    const foodUnitMap = foodUnits.reduce((map, fu) => {
      map[`${fu.foodId}-${fu.unitId}`] = parseFloat(fu.gramsPerUnit);
      return map;
    }, {});

    const ingredientRecordsToCreate = [];

    for (const ing of ingredients) {
      const caloriesPerGram = foodMap[ing.foodId];
      const gramsPerUnit = foodUnitMap[`${ing.foodId}-${ing.unitId}`];
      
      if (!gramsPerUnit) {
        throw new Error(`No conversion found for food ${ing.foodId} with unit ${ing.unitId}`);
      }

      const quantity = parseFloat(ing.quantity);
      const ingredientGrams = quantity * gramsPerUnit;
      
      if (caloriesPerGram !== undefined && ingredientGrams) {
        totalGrams += ingredientGrams;
        totalCalories += caloriesPerGram * ingredientGrams;
      }

      ingredientRecordsToCreate.push({
        recipeId: id,
        foodId: ing.foodId,
        quantity: quantity,
        unitId: ing.unitId,
        grams: ingredientGrams.toFixed(2),
        createdBy: userId,
      });
    }

    // Update recipe
    await recipe.update({
      name,
      instructions: instructions || null,
      servings: parseInt(servings) || 1,
      totalGrams: totalGrams.toFixed(2),
      totalCalories: totalCalories.toFixed(2),
    }, { transaction: t });

    // Delete old ingredients and create new ones
    await RecipeIngredient.destroy({
      where: { recipeId: id },
      transaction: t
    });

    await RecipeIngredient.bulkCreate(ingredientRecordsToCreate, { transaction: t });

    await t.commit();

    res.json({
      recipe: {
        ...recipe.toJSON(),
        ingredients: ingredientRecordsToCreate
      },
      caloriesPerServing: totalCalories / (parseInt(servings) || 1),
      message: "Recipe updated successfully!"
    });
  } catch (error) {
    await t.rollback();
    console.error("Error updating recipe:", error);
    res.status(500).json({ error: error.message || "Error updating recipe." });
  }
});

// --- DELETE /api/recipes/:id: delete a recipe ---
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  const t = await sequelize.transaction();

  try {
    // Verify recipe exists and belongs to user
    const recipe = await Recipe.findOne({
      where: { id, userId },
      transaction: t
    });

    if (!recipe) {
      await t.rollback();
      return res.status(404).json({ error: "Recipe not found or you don't have permission to delete it" });
    }

    // Delete recipe ingredients
    await RecipeIngredient.destroy({
      where: { recipeId: id },
      transaction: t
    });

    // Delete recipe
    await recipe.destroy({ transaction: t });

    await t.commit();
    res.status(204).send();
  } catch (error) {
    await t.rollback();
    console.error("Error deleting recipe:", error);
    res.status(500).json({ error: "Error deleting recipe" });
  }
});

module.exports = router;
