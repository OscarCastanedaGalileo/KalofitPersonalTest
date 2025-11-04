const db = require("../config/database");
const { FoodLog, Food, Unit, Tag, FoodLogTag, FoodCategory, User, sequelize } = require("../models");
const { Op, Sequelize, where } = require("sequelize");
const logger = require("../config/logger");
const { DateTime } = require("luxon");

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

  let date;
  // Si es un objeto Date de JavaScript
  if (value instanceof Date) {
    date = DateTime.fromJSDate(value);
  }
  // Si es un string, intentar diferentes formatos
  else if (typeof value === 'string') {
    // Intentar formato ISO primero
    date = DateTime.fromISO(value);

    // Si no funciona, intentar formato YYYY-MM-DD HH:mm:ss (con espacio)
    if (!date.isValid) {
      date = DateTime.fromFormat(value, 'yyyy-MM-dd HH:mm:ss');
    }
    // Si no funciona, intentar formato YYYY-MM-DD
    if (!date.isValid) {
      date = DateTime.fromFormat(value, 'yyyy-MM-dd');
  // console.log({value, fieldName, date});
    }

    // Si aún no funciona, intentar formato DD/MM/YYYY
    if (!date.isValid) {
      date = DateTime.fromFormat(value, 'dd/MM/yyyy');
    }

    // Si aún no funciona, intentar formato MM/DD/YYYY
    if (!date.isValid) {
      date = DateTime.fromFormat(value, 'MM/dd/yyyy');
    }
  }

  if (!date || !date.isValid) {
    return `${fieldName} must be a valid date`;
  }

  return null;
}

function parseFlexibleDate(value) {
  if (!value) return DateTime.now();

  // Si es un objeto Date de JavaScript
  if (value instanceof Date) {
    return DateTime.fromJSDate(value);
  }
  
  // Si es un string, intentar primero ISO (el formato más común y rápido)
  if (typeof value === 'string') {
    let date = DateTime.fromISO(value);
    
    // Si no es ISO, intentar otros formatos comunes
    if (!date.isValid) {
      const formats = [
        'yyyy-MM-dd HH:mm:ss',
        'yyyy-MM-dd',
        'dd/MM/yyyy'
      ];
      
      for (const format of formats) {
        date = DateTime.fromFormat(value, format);
        if (date.isValid) break;
      }
    }
    
    if (date.isValid) return date;
  }

  // Si no se pudo parsear, devolver fecha actual
  return DateTime.now();
}

// Helper function to assign tags to a food log
async function assignTagsToFoodLog(foodLogId, tagNames, userId) {
  if (!tagNames || !Array.isArray(tagNames) || tagNames.length === 0) return;

  const tagRecords = [];
  for (const name of tagNames) {
    if (typeof name !== 'string' || !name.trim()) continue;
    const trimmedName = name.trim();
    let tag = await Tag.findOne({ where: { name: trimmedName } });
    if (!tag) {
      tag = await Tag.create({ name: trimmedName, userId: userId });
    }
    tagRecords.push(tag);
  }

  // Create FoodLogTag associations
  const associations = tagRecords.map(tag => ({
    foodLogId,
    tagId: tag.id,
    createdBy: userId,
  }));
  await FoodLogTag.bulkCreate(associations);
}

module.exports = {
  // create a new food log entry
  async createFoodLog(req, res) {
    try {
      const userId = req.user.id;
      let { foodId, grams, calories, quantity, consumedAt, unitId, recipeId, tags } = req.body;
      console.log({ foodId, grams, calories, quantity, consumedAt, unitId, recipeId, tags });
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
        console.log({ error });
        if (error) return res.status(400).json({ message: error });
      }

      if (!calories && foodId) {
        try {
          const food = await Food.findByPk(foodId, { 
            attributes: ["id", "name", "caloriesPerGram"],
            raw: true // Get plain object for better performance
          });
          
          if (!food) {
            return res.status(400).json({ message: "Food not found" });
          }
          if (food.caloriesPerGram == null) {
            return res.status(400).json({ message: "Food has no caloriesPerGram defined" });
          }
          
          calories = Number(grams) * Number(food.caloriesPerGram);
          
          if (isNaN(calories)) {
            logger.error(`Error calculating calories: grams=${grams}, caloriesPerGram=${food.caloriesPerGram}, foodId=${foodId}`);
            return res.status(400).json({ message: "Error calculating calories - invalid numbers" });
          }
        } catch (error) {
          logger.error(`Error fetching food data for calorie calculation: ${error.message}`);
          return res.status(500).json({ message: "Error calculating calories" });
        }
      }

      if (!calories) {
        return res.status(400).json({ message: "Provide calories or a valid foodId to calculate them" });
      }
      console.log({consumedAt});
      const payload = {
        userId,
        foodId: foodId || null,
        unitId: unitId || null,
        recipeId: recipeId || null,
        grams,
        quantity,
        totalCalories: calories,
        consumedAt: consumedAt ? parseFlexibleDate(consumedAt).setZone('America/Guatemala').toJSDate() : DateTime.now().setZone('America/Guatemala').toJSDate(),
        notes: req.body.notes,
      };
      console.log({payload});
      const newFoodLog = await FoodLog.create(payload);
      await assignTagsToFoodLog(newFoodLog.id, tags, userId);
      res.status(201).json(formatFoodLogResponse(newFoodLog));
    } catch (error) {
      logger.error(`Error creating food log: ${error.message}`);
      const pg = error?.parent || {};
      res.status(400).json({
        message: error.message,
        code: pg.code,
        detail: pg.detail,
        constraint: pg.constraint,
      });
    }
  },

  // get food logs for a user
  async getFoodLogs(req, res) {
    try {
      const userId = req.user.id;
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

      const where = { userId, deletedAt: null };
      if (from && to) {
        where.consumedAt = { [Op.between]: [parseFlexibleDate(from).toJSDate(), parseFlexibleDate(to).toJSDate()] };
      }

      const foodLogs = await FoodLog.findAll({
        where,
        include: [
          { model: Food, as: "food" },
          { model: Unit, as: "unit" },
          { model: Tag, as: "tags", through: { attributes: [] } }, // Include tags
        ],
        order: [['consumedAt', 'ASC'], ['id', 'ASC']],
      });
      res.json(formatFoodLogArrayResponse(foodLogs));
    } catch (error) {
      logger.error(`Error fetching food logs: ${error.message}`);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  // get single food log by id
  async getFoodLogById(req, res) {
    try {
      const userId = req.user.id;
      const { id } = req.params;

      // Validation
      const idNum = parseInt(id, 10);
      if (isNaN(idNum) || idNum <= 0) {
        return res.status(400).json({ message: "id must be a positive integer" });
      }

      const entry = await FoodLog.findOne({
        where: { id: idNum, userId, deletedAt: null },
        include: [
          { model: Food, as: "food" },
          { model: Unit, as: "unit" },
          { model: Tag, as: "tags", through: { attributes: [] } },
        ],
      });

      if (!entry) {
        return res.status(404).json({ message: "Entry not found" });
      }

      res.json(formatFoodLogResponse(entry));
    } catch (error) {
      logger.error(`Error fetching food log: ${error.message}`);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  // update food log
  async updateFoodLog(req, res) {
    try {
      const userId = req.user.id;
      const { id } = req.params;

      // Validation for id
      const idNum = parseInt(id, 10);
      if (isNaN(idNum) || idNum <= 0) {
        return res.status(400).json({ message: "id must be a positive integer" });
      }

      let { foodId, grams, calories, consumedAt, notes, unitId, recipeId, tags } = req.body;

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
        consumedAt: consumedAt ? parseFlexibleDate(consumedAt).setZone('America/Guatemala').toJSDate() : undefined,
        notes,
      }, {
        where: { id: idNum, userId, deletedAt: null },
      });

      if (!updated) {
        return res.status(404).json({ message: "Entry not found or not updated" });
      }

      // Remove existing tags and assign new ones
      await FoodLogTag.destroy({ where: { foodLogId: idNum } });
      await assignTagsToFoodLog(idNum, tags, userId);

      const entry = await FoodLog.findByPk(idNum);
      res.json(formatFoodLogResponse(entry));
    } catch (error) {
      logger.error(`Error updating food log: ${error.message}`);
      const pg = error?.parent || {};
      res.status(400).json({
        message: error.message,
        code: pg.code,
        detail: pg.detail,
        constraint: pg.constraint,
      });
    }
  },

  // get entries for a date and total calories
  async getByDate(req, res) {
    try {
      const userId = req.user?.id || req.query.userId;
      const date = req.query.date; // expected format: YYYY-MM-DD
      if (!date) return res.status(400).json({ error: "date query param required" });

      const startOfDay = parseFlexibleDate(date).startOf('day').toJSDate();
      const endOfDay = parseFlexibleDate(date).endOf('day').toJSDate();

      const entries = await FoodLog.findAll({
        where: { userId, consumedAt: { [Op.between]: [startOfDay, endOfDay] } },
        order: [['consumedAt', 'ASC'], ['createdAt', 'ASC']]
      });

      const total = entries.reduce((sum, e) => sum + (e.totalCalories || 0), 0);

      res.json({ date, totalCalories: total, entries: formatFoodLogArrayResponse(entries) });
    } catch (error) {
      logger.error(`Error fetching food logs by date: ${error.message}`);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  // get detailed entries for a date with food details, tags, and categories
  async getDetailedByDate(req, res) {
    try {
      const userId = req.user.id;
      const date = req.query.date; // expected format: YYYY-MM-DD
      if (!date) return res.status(400).json({ error: "date query param required" });

      const startOfDay = parseFlexibleDate(date).startOf('day').toJSDate();
      const endOfDay = parseFlexibleDate(date).endOf('day').toJSDate();

      const entries = await FoodLog.findAll({
        where: {
          userId,
          consumedAt: { [Op.between]: [startOfDay, endOfDay] },
          deletedAt: null
        },
        include: [
          {
            model: Food,
            as: "food",
            include: [
              {
                model: FoodCategory,
                as: "category",
                attributes: ['id', 'name']
              }
            ]
          },
          {
            model: Unit,
            as: "unit",
            attributes: ['id', 'name']
          },
          {
            model: Tag,
            as: "tags",
            through: { attributes: [] },
            attributes: ['id', 'name']
          }
        ],
        order: [['consumedAt', 'ASC'], ['createdAt', 'ASC']]
      });

      const total = entries.reduce((sum, e) => sum + (e.totalCalories || 0), 0);

      res.json({
        date,
        totalCalories: total,
        entries: formatFoodLogArrayResponse(entries)
      });
    } catch (error) {
      logger.error(`Error fetching detailed food logs by date: ${error.message}`);
      res.status(500).json({ error: "Internal server error" });
    }
  },
  // get history of dates with totals
  async getDateTotals(req, res) {
    try {
      const userId = req.user?.id || req.query.userId;
      const limit = parseInt(req.query.limit) || 30;
      const offset = parseInt(req.query.offset) || 0;

      const results = await FoodLog.findAll({
        attributes: [
          [Sequelize.fn('DATE', Sequelize.col('consumedAt')), 'date'],
          [Sequelize.fn('SUM', Sequelize.col('totalCalories')), 'totalCalories'],
          [Sequelize.fn('COUNT', Sequelize.col('id')), 'entryCount']
        ],
        where: { userId },
        group: [Sequelize.fn('DATE', Sequelize.col('consumedAt'))],
        order: [[Sequelize.fn('DATE', Sequelize.col('consumedAt')), 'DESC']],
        limit,
        offset,
      });

      res.json(results);
    } catch (error) {
      logger.error(`Error fetching date totals: ${error.message}`);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  // get daily calories summary for dashboard
  async getDailyCaloriesSummary(req, res) {
    try {
      const userId = req.user.id;
      const DEFAULT_GOAL = 2000; // Meta calórica por defecto

      const today = DateTime.now().startOf('day').toJSDate();

      // Obtener la meta calórica del perfil del usuario
      const user = await User.findByPk(userId, {
        include: [{
          model: require('../models').Profile,
          as: 'profile'
        }]
      });
      const dailyGoal = user?.profile?.dailyKcalGoal || DEFAULT_GOAL;

      // Sumar las calorías consumidas hoy
      const Op = require("sequelize").Op;
      const result = await FoodLog.sum("totalCalories", {
        where: {
          userId: userId,
          consumedAt: {
            [Op.gte]: today,
          },
          deletedAt: null
        },
      });

      const totalConsumed = parseFloat(result || 0);

      res.json({
        totalConsumed: totalConsumed,
        dailyGoal: dailyGoal,
        message: "Daily calories summary fetched successfully",
      });
    } catch (error) {
      logger.error(`Error fetching daily calories summary: ${error.message}`);
      res.status(500).json({ error: "Error fetching daily calories summary" });
    }
  },

  // soft delete a food log entry
  async deleteFoodLog(req, res) {
    try {
      const userId = req.user.id;
      const id = req.params.id;

      // Validation
      const idNum = parseInt(id, 10);
      if (isNaN(idNum) || idNum <= 0) {
        return res.status(400).json({ message: "id must be a positive integer" });
      }

      const deleted = await FoodLog.destroy({ where: { id: idNum, userId, deletedAt: null } });
      if (deleted) {
        res.status(204).send();
      } else {
        res.status(404).json({ error: "Food log entry not found" });
      }
    } catch (error) {
      logger.error(`Error deleting food log: ${error.message}`);
      res.status(500).json({ error: "Internal server error" });
    }
  },

};

// Helper function to format food log response
function formatFoodLogResponse(foodLog) {
  if (!foodLog) return null;

  const formatted = foodLog.toJSON ? foodLog.toJSON() : foodLog;
  if (formatted.consumedAt) {
    formatted.consumedAt = DateTime.fromJSDate(new Date(formatted.consumedAt)).setZone('America/Guatemala').toISO();
  }
  return formatted;
}

// Helper function to format food log array response
function formatFoodLogArrayResponse(foodLogs) {
  return foodLogs.map(formatFoodLogResponse);
}
