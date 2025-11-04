const { FoodUnit, Food, Unit, User, FoodCategory } = require("../models");
const logger = require("../config/logger");

// Validation helpers
function validateNumber(value, fieldName, min = 0) {
  if (value == null) return null;
  const num = Number(value);
  if (isNaN(num) || num < min) {
    return `${fieldName} must be a number greater than or equal to ${min}`;
  }
  return null;
}

const foodUnitController = {
  // Create a new food unit
  async createFoodUnit(req, res) {
    try {
      const userId = req.user.id;
      const { foodId, unitId, gramsPerUnit } = req.body;

      // Validations
      let error = validateNumber(foodId, 'foodId', 1);
      if (error) return res.status(400).json({ message: error });

      error = validateNumber(unitId, 'unitId', 1);
      if (error) return res.status(400).json({ message: error });

      error = validateNumber(gramsPerUnit, 'gramsPerUnit', 0.01);
      if (error) return res.status(400).json({ message: error });

      // Check if food exists
      const food = await Food.findByPk(foodId);
      if (!food) return res.status(400).json({ message: "Food not found" });

      // Check if unit exists
      const unit = await Unit.findByPk(unitId);
      if (!unit) return res.status(400).json({ message: "Unit not found" });

      // Check if combination already exists
      const existing = await FoodUnit.findOne({ where: { foodId, unitId } });
      if (existing) return res.status(400).json({ message: "FoodUnit already exists for this food and unit" });

      const newFoodUnit = await FoodUnit.create({
        foodId,
        unitId,
        gramsPerUnit,
        createdBy: userId,
      });

      res.status(201).json(newFoodUnit);
    } catch (error) {
      logger.error(`Error creating food unit: ${error.message}`);
      const pg = error?.parent || {};
      res.status(400).json({
        message: error.message,
        code: pg.code,
        detail: pg.detail,
        constraint: pg.constraint,
      });
    }
  },

  // Get all food units
  async getFoodUnits(req, res) {
    try {
      const { foodId, unitId } = req.query;
      const where = {};

      // Add filters if provided
      if (foodId) {
        const foodIdNum = parseInt(foodId, 10);
        if (isNaN(foodIdNum) || foodIdNum <= 0) {
          return res.status(400).json({ message: "foodId must be a positive integer" });
        }
        where.foodId = foodIdNum;
      }

      if (unitId) {
        const unitIdNum = parseInt(unitId, 10);
        if (isNaN(unitIdNum) || unitIdNum <= 0) {
          return res.status(400).json({ message: "unitId must be a positive integer" });
        }
        where.unitId = unitIdNum;
      }

      const foodUnits = await FoodUnit.findAll({
        where,
        include: [
          { model: Food, as: "food", attributes: ["id", "name"], include: [{ model: FoodCategory, as: "category", attributes: ["id", "name"] }] },
          { model: Unit, as: "unit", attributes: ["id", "name", "type"] },
          { model: User, as: "creator", attributes: ["id", "name"] },
        ],
      });
      res.json(foodUnits);
    } catch (error) {
      logger.error(`Error fetching food units: ${error.message}`);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  // Get food unit by id
  async getFoodUnitById(req, res) {
    try {
      const { id } = req.params;
      const idNum = parseInt(id, 10);
      if (isNaN(idNum) || idNum <= 0) {
        return res.status(400).json({ message: "id must be a positive integer" });
      }

      const foodUnit = await FoodUnit.findByPk(idNum, {
        include: [
          { model: Food, as: "food", attributes: ["id", "name"], include: [{ model: FoodCategory, as: "category", attributes: ["id", "name"] }] },
          { model: Unit, as: "unit", attributes: ["id", "name", "type"] },
          { model: User, as: "creator", attributes: ["id", "name"] },
        ],
      });

      if (!foodUnit) {
        return res.status(404).json({ message: "FoodUnit not found" });
      }

      res.json(foodUnit);
    } catch (error) {
      logger.error(`Error fetching food unit: ${error.message}`);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  // Update food unit
  async updateFoodUnit(req, res) {
    try {
      const { id } = req.params;
      const idNum = parseInt(id, 10);
      if (isNaN(idNum) || idNum <= 0) {
        return res.status(400).json({ message: "id must be a positive integer" });
      }

      const { foodId, unitId, gramsPerUnit } = req.body;

      // Validations
      let error;
      if (foodId != null) {
        error = validateNumber(foodId, 'foodId', 1);
        if (error) return res.status(400).json({ message: error });
      }
      if (unitId != null) {
        error = validateNumber(unitId, 'unitId', 1);
        if (error) return res.status(400).json({ message: error });
      }
      if (gramsPerUnit != null) {
        error = validateNumber(gramsPerUnit, 'gramsPerUnit', 0.01);
        if (error) return res.status(400).json({ message: error });
      }

      const [updated] = await FoodUnit.update({
        foodId: foodId || undefined,
        unitId: unitId || undefined,
        gramsPerUnit: gramsPerUnit || undefined,
      }, {
        where: { id: idNum },
      });

      if (!updated) {
        return res.status(404).json({ message: "FoodUnit not found or not updated" });
      }

      const foodUnit = await FoodUnit.findByPk(idNum);
      res.json(foodUnit);
    } catch (error) {
      logger.error(`Error updating food unit: ${error.message}`);
      const pg = error?.parent || {};
      res.status(400).json({
        message: error.message,
        code: pg.code,
        detail: pg.detail,
        constraint: pg.constraint,
      });
    }
  },

  // Delete food unit
  async deleteFoodUnit(req, res) {
    try {
      const { id } = req.params;
      const idNum = parseInt(id, 10);
      if (isNaN(idNum) || idNum <= 0) {
        return res.status(400).json({ message: "id must be a positive integer" });
      }

      const deleted = await FoodUnit.destroy({ where: { id: idNum } });
      if (!deleted) {
        return res.status(404).json({ message: "FoodUnit not found" });
      }

      res.status(204).send();
    } catch (error) {
      logger.error(`Error deleting food unit: ${error.message}`);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  // Get all units (no maintenance, just read)
  async getUnits(req, res) {
    console.log("GET /foodunits/units called");
    try {
      const units = await Unit.findAll();
      res.json(units);
    } catch (error) {
      logger.error(`Error fetching units: ${error.message}`);
      res.status(500).json({ error: "Error fetching units" });
    }
  },
};

module.exports = foodUnitController;
