var express = require("express");
var router = express.Router();
const { Op } = require("sequelize");
const { Food, FoodCategory, FoodUnit, sequelize } = require("../models");
const { requireAuth } = require("../middlewares/requireAuth");

router.use(requireAuth);

// POST NEW FOOD
router.post("/", async (req, res) => {
  const { name, caloriesPerGram, foodCategoryId } = req.body;
  const userId = req.user.id;
  try {
    const category = await FoodCategory.findByPk(foodCategoryId);

    if (!category) return res.status(400).json({ message: "Categoría no encontrada" });

    const newFood = await Food.create({
      name,
      caloriesPerGram,
      foodCategoryId,
      createdBy: userId,
      isCustom: true,
    });

    res.status(201).json({ food: newFood });
  } catch (error) {
    console.error("Error saving food:", error);
    res.status(500).json({ error: "Error saving food" });
  }
});

//  GET all foods
router.get("/", async (req, res) => {
  try {
    const userId = req.user.id;
    const isAdmin = req.user.role === 'admin';
    const whereClause = isAdmin ? {} : { isCustom: true, createdBy: userId };
    const allFoods = await Food.findAll({
      where: whereClause,
      attributes: ["id", "name", "caloriesPerGram", "isCustom", "foodCategoryId"],
      include: [
        {
          model: FoodCategory,
          as: "category",
          attributes: ["id", "name"]
        }
      ]
    });

    res.json(allFoods);
  } catch (error) {
    console.error("Error FATAL fetching eligible foods (500 likely due to include):", error);
    // Devolvemos 500 para notificar al frontend.
    res.status(500).json({ error: "Error interno del servidor al cargar alimentos. Verifique la asociación FoodUnit." });
  }
});

// route /all
router.get("/all", async (req, res) => {
  try {
    const allFoods = await Food.findAll({
      include: [{ model: FoodCategory, as: "category", attributes: ["id", "name"] }],
    });
    res.json(allFoods);
  } catch (error) {
    console.error("Error fetching all foods:", error);
    res.status(500).json({ error: "Error fetching all foods" });
  }
});

// GET Food by ID
router.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const food = await Food.findByPk(id);
    if (!food) return res.status(404).json({ error: "Food not found" });

    const userId = req.user.id;
    const isAdmin = req.user.role === 'admin';
    if (!isAdmin && food.createdBy !== userId) {
      return res.status(403).json({ error: "Access denied to this food" });
    }

    res.json(food);
  } catch (error) {
    console.error("Error fetching food:", error);
    res.status(500).json({ error: "Error fetching food" });
  }
});

/*
// DELETE FOOD by ID (only deletes if createdBy matches user)
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id

  try {
    // Searches for the food first
    const food = await Food.findByPk(id);
    if (!food) return res.status(404).json({ error: "Food not found" });

    // Only allows deletion if the creator matches
    if (Number(food.createdBy) !== Number(userId)) {
      return res.status(403).json({ error: "You can only delete foods you created" });
    }

    await Food.destroy({ where: { id } });
    res.json({ message: "Food deleted successfully" });
  } catch (error) {
    console.error("Error deleting food:", error);
    res.status(500).json({ error: "Error deleting food" });
  }
}); */

// SOFT DELETE FOOD by ID (only soft-deletes if createdBy matches user or admin)
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const isAdmin = req.user.role === 'admin';

  try {
    const whereClause = isAdmin ? { id: id } : { id: id, createdBy: userId };
    const deletedRows = await Food.destroy({
      where: whereClause,
    });

    if (deletedRows === 0) {
      return res.status(404).json({ error: "Food not found or you can only delete foods you created" });
    }

    res.status(204).send();
  } catch (error) {
    console.error("Error soft-deleting food:", error);
    res.status(500).json({ error: "Error soft-deleting food" });
  }
});

// UPDATE FOOD by ID
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { name, caloriesPerGram, foodCategoryId } = req.body;

  console.log("PUT /foods/:id called with id =", id, "body:", req.body);

  try {
    const food = await Food.findByPk(id);
    if (!food) return res.status(404).json({ error: "Food not found" });

    const userId = req.user.id;
    const isAdmin = req.user.role === 'admin';
    if (!isAdmin && food.createdBy !== userId) {
      return res.status(403).json({ error: "You can only update foods you created" });
    }

    // Actualiza campos
    food.name = name;
    food.caloriesPerGram = caloriesPerGram;
    food.foodCategoryId = foodCategoryId;

    await food.save();

    res.json({ message: "Food updated successfully", food });
  } catch (error) {
    console.error("Error updating food:", error);
    res.status(500).json({ error: "Error updating food" });
  }
});

module.exports = router;
