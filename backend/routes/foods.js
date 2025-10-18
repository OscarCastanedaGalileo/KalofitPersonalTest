var express = require("express");
var router = express.Router();
const { Food } = require("../models");

// POST NEW FOOD
router.post("/", async (req, res) => {
  const { name, caloriesPerGram, foodCategoryId, createdBy, isCustom } = req.body;

  try {
    const newFood = await Food.create({
      name,
      caloriesPerGram,
      foodCategoryId,
      createdBy,
      isCustom,
    });

    res.status(201).json({ food: newFood });
  } catch (error) {
    console.error("Error saving food:", error);
    res.status(500).json({ error: "Error saving food" });
  }
});

// GET all foods
router.get("/", async (req, res) => {
  try {
    const allFoods = await Food.findAll();
    res.json(allFoods);
  } catch (error) {
    console.error("Error fetching foods:", error);
    res.status(500).json({ error: "Error fetching foods" });
  }
});

// GET Food by ID
router.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const food = await Food.findByPk(id);
    if (!food) return res.status(404).json({ error: "Food not found" });

    res.json(food);
  } catch (error) {
    console.error("Error fetching food:", error);
    res.status(500).json({ error: "Error fetching food" });
  }
});

// DELETE FOOD by ID (only deletes if createdBy matches user)
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  const userId = 1; // For testing, will replace later with the real logged-in user

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
});

// UPDATE FOOD by ID
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { name, caloriesPerGram, foodCategoryId } = req.body;

  console.log("PUT /foods/:id called with id =", id, "body:", req.body);

  try {
    const food = await Food.findByPk(id);
    if (!food) return res.status(404).json({ error: "Food not found" });

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
