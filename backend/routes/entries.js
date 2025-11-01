const express = require("express");
const { Op } = require("sequelize");
const { FoodLog, Food } = require("../models");
const { requireAuth } = require("../middlewares/requireAuth");
const router = express.Router();

// Apply requireAuth to all routes
router.use(requireAuth);

const resolveUserId = (req) => req.user.id;

// Validation helpers
function validateNumber(value, fieldName, min = 0) {
  if (value == null) return null;
  const num = Number(value);
  if (isNaN(num) || num < min) {
    return `${fieldName} must be a number greater than or equal to ${min}`;
  }
  return null;
}

function validateDate(value, fieldName) {
  if (!value) return null;
  const date = new Date(value);
  if (isNaN(date.getTime())) {
    return `${fieldName} must be a valid date`;
  }
  return null;
}

router.post("/", async (req, res, next) => {
  try {
    const userId = resolveUserId(req);
    let { foodId, grams, calories, consumedAt, unitId, recipeId } = req.body;

    // Validations
    if (foodId && recipeId) {
      return res.status(400).json({ message: "Cannot provide both foodId and recipeId" });
    }

    let error = validateNumber(grams, 'grams', 0.01);
    if (error) return res.status(400).json({ message: error });

    if (foodId != null) {
      error = validateNumber(foodId, 'foodId', 1);
      if (error) return res.status(400).json({ message: error });
      if (!unitId) {
        return res.status(400).json({ message: "unitId is required when providing foodId" });
      }
    }

    if (unitId != null) {
      error = validateNumber(unitId, 'unitId', 1);
      if (error) return res.status(400).json({ message: error });
    }

    if (recipeId != null) {
      error = validateNumber(recipeId, 'recipeId', 1);
      if (error) return res.status(400).json({ message: error });
      // unitId is not required for recipes
    }

    if (calories != null) {
      error = validateNumber(calories, 'calories', 0);
      if (error) return res.status(400).json({ message: error });
    }

    if (consumedAt) {
      error = validateDate(consumedAt, 'consumedAt');
      if (error) return res.status(400).json({ message: error });
    }

    if (!calories && foodId) {
      const food = await Food.findByPk(foodId, { attributes: ["id", "name", "caloriesPerGram"] });
      if (!food) {
        return res.status(400).json({ message: "Food not found" });
      }
      if (food.caloriesPerGram == null) {
        return res.status(400).json({ message: "Food has no caloriesPerGram defined" });
      }
      calories = Number(grams) * Number(food.caloriesPerGram);
    }

    if (!calories) {
      return res.status(400).json({ message: "Provide calories or a valid foodId to calculate them" });
    }

    const entry = await FoodLog.create({
      userId,
      foodId: foodId || null,
      unitId: unitId || null,
      recipeId: recipeId || null,
      grams,
      totalCalories: calories,
      consumedAt: consumedAt ? new Date(consumedAt) : new Date(),
    });

    res.status(201).json(entry);
  } catch (err) {
    // logger.error(err);
    const pg = err?.parent || {};
    return res.status(400).json({
      message: err.message,
      code: pg.code,
      detail: pg.detail,
      constraint: pg.constraint,
    });
  }
});

router.get("/", async (req, res, next) => {
  try {
    const userId = resolveUserId(req);
    const { from, to } = req.query;

    // Validations
    let error;
    if (from) {
      error = validateDate(from, 'from');
      if (error) return res.status(400).json({ message: error });
    }
    if (to) {
      error = validateDate(to, 'to');
      if (error) return res.status(400).json({ message: error });
    }

    const where = { userId };
    if (from && to) {
      where.consumedAt = { [Op.between]: [new Date(from), new Date(to)] };
    }

    const entries = await FoodLog.findAll({
      where,
      order: [
        ["consumedAt", "ASC"],
        ["id", "ASC"],
      ],
    });

    res.json(entries);
  } catch (e) {
    next(e);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const userId = resolveUserId(req);
    const { id } = req.params;

    // Validation
    const idNum = parseInt(id, 10);
    if (isNaN(idNum) || idNum <= 0) {
      return res.status(400).json({ message: "id must be a positive integer" });
    }

    const entry = await FoodLog.findOne({
      where: { id: idNum, userId },
    });

    if (!entry) {
      return res.status(404).json({ message: "Entry not found" });
    }

    res.json(entry);
  } catch (e) {
    next(e);
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    const userId = resolveUserId(req);
    const { id } = req.params;

    // Validation for id
    const idNum = parseInt(id, 10);
    if (isNaN(idNum) || idNum <= 0) {
      return res.status(400).json({ message: "id must be a positive integer" });
    }

    let { foodId, grams, calories, consumedAt, notes, unitId, recipeId } = req.body;

    // Validations
    if (foodId && recipeId) {
      return res.status(400).json({ message: "Cannot provide both foodId and recipeId" });
    }

    let error = validateNumber(grams, 'grams', 0.01);
    if (error) return res.status(400).json({ message: error });

    if (foodId != null) {
      error = validateNumber(foodId, 'foodId', 1);
      if (error) return res.status(400).json({ message: error });
      if (!unitId) {
        return res.status(400).json({ message: "unitId is required when providing foodId" });
      }
    }

    if (unitId != null) {
      error = validateNumber(unitId, 'unitId', 1);
      if (error) return res.status(400).json({ message: error });
    }

    if (recipeId != null) {
      error = validateNumber(recipeId, 'recipeId', 1);
      if (error) return res.status(400).json({ message: error });
      // unitId is not required for recipes
    }

    if (calories != null) {
      error = validateNumber(calories, 'calories', 0);
      if (error) return res.status(400).json({ message: error });
    }

    if (consumedAt) {
      error = validateDate(consumedAt, 'consumedAt');
      if (error) return res.status(400).json({ message: error });
    }

    if (!calories && foodId) {
      const food = await Food.findByPk(foodId, { attributes: ["id", "name", "caloriesPerGram"] });
      if (!food) {
        return res.status(400).json({ message: "Food not found" });
      }
      if (food.caloriesPerGram == null) {
        return res.status(400).json({ message: "Food has no caloriesPerGram defined" });
      }
      calories = Number(grams) * Number(food.caloriesPerGram);
    }

    if (!calories) {
      return res.status(400).json({ message: "Provide calories or a valid foodId to calculate them" });
    }

    const [updated] = await FoodLog.update({
      foodId: foodId || null,
      unitId: unitId || null,
      recipeId: recipeId || null,
      grams,
      totalCalories: calories,
      consumedAt: consumedAt ? new Date(consumedAt) : undefined,
      notes,
    }, {
      where: { id: idNum, userId },
    });

    if (!updated) {
      return res.status(404).json({ message: "Entry not found or not updated" });
    }

    const entry = await FoodLog.findByPk(idNum);
    res.json(entry);
  } catch (err) {
    const pg = err?.parent || {};
    return res.status(400).json({
      message: err.message,
      code: pg.code,
      detail: pg.detail,
      constraint: pg.constraint,
    });
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const userId = resolveUserId(req);
    const { id } = req.params;

    // Validation
    const idNum = parseInt(id, 10);
    if (isNaN(idNum) || idNum <= 0) {
      return res.status(400).json({ message: "id must be a positive integer" });
    }

    const deleted = await FoodLog.destroy({
      where: { id: idNum, userId },
    });

    if (!deleted) {
      return res.status(404).json({ message: "Entry not found" });
    }

    res.status(204).send();
  } catch (e) {
    next(e);
  }
});

module.exports = router;
